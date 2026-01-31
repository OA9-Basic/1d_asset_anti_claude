#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastTreeAndCopy - نسخة محسنة من سكربت إنشاء شجرة المشروع + نسخ الملفات
مزايا:
- مرور واحد على الملفات (بناء شجرة + جمع قائمة نسخ)
- cache لقرارات الاستبعاد لتقليل التكلفة
- نسخ متوازي باستخدام ThreadPoolExecutor بعدد أنوية الجهاز
- tqdm progress bar + logging مفصل
- يحافظ على نظام أسماء الملفات: يحول المسار إلى اسم ملف واحد مفصّل
"""

from __future__ import annotations
import os
import shutil
import logging
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Iterable, Tuple, Dict, List, Set
from dataclasses import dataclass, field
from time import perf_counter
from tqdm import tqdm
from functools import lru_cache

# -------------------------
# CONFIG (عدل هنا لو رغبت)
# -------------------------
BASE_DIR = Path("./")
OUTPUT_TREE_FILE = Path("tree-all.txt")
DEST_DIR = Path("files-all")

EXCLUDE_TREE_AND_COPY_DIRS: Set[str] = {
    "target", ".next", "__pycache__", ".github", ".vscode",".playwright-mcp",
    "audit-reports", "audit", ".git", "broadcast", "cache", "out","node_modules","venv","env"
}
EXCLUDE_COPY_ONLY_DIRS: Set[str] = {"dist","tests"}
EXCLUDE_COPY_EXTENSIONS: Set[str] = {
    ".db", ".sqlite", ".md", ".exe", ".lock", ".TAG",
    ".gitignore", ".gitmodules", "package-lock.json","__init__.py",".log"
}
# ملاحظة: المجموعة التالية تُستعمل للتحويل إلى .txt وللاستثناء الخاص بالملفات المخفية
ADD_TXT_ON_COPY_EXTENSIONS: Set[str] = {
    ".php", ".env.local", ".toml", ".rs", ".yml", ".env", ".gitignore", ".sol", ".info"
}

# أي ملفات مخفية (تبدأ بـ '.') نسمح بنسخها إذا اسم الملف ينتهي بأي عنصر في ADD_TXT...
# مثال: ".env", ".env.local", ".gitignore"
ALLOWED_HIDDEN_SUFFIXES = tuple(ADD_TXT_ON_COPY_EXTENSIONS)

# -------------------------
# لوقنج
# -------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("FastTreeAndCopy")

# -------------------------
# Helpers & Dataclasses
# -------------------------
@dataclass
class FileEntry:
    src: Path
    rel: Path
    size: int
    out_name: str

@dataclass
class FastTreeAndCopy:
    base_dir: Path
    dest_dir: Path
    output_tree_file: Path
    exclude_tree_and_copy_dirs: Set[str]
    exclude_copy_only_dirs: Set[str]
    exclude_copy_extensions: Set[str]
    add_txt_on_copy_extensions: Set[str]
    # internal caches/fields
    _exclude_tree_cache: Dict[str, bool] = field(default_factory=dict, init=False)
    _exclude_copy_cache: Dict[str, bool] = field(default_factory=dict, init=False)
    files_to_copy: List[FileEntry] = field(default_factory=list, init=False)
    tree_lines: List[str] = field(default_factory=list, init=False)

    def __post_init__(self):
        # Precompute combined exclude set for copying
        self._copy_excluded_dirs = self.exclude_tree_and_copy_dirs | self.exclude_copy_only_dirs
        # Normalize sets to strings (dir names)
        self._exclude_tree_dirs = set(self.exclude_tree_and_copy_dirs)

    # -------------------------
    # Exclusion logic (cached)
    # -------------------------
    def _path_parts(self, path: Path) -> List[str]:
        # Return parts relative to base_dir (strings)
        try:
            rel = path.relative_to(self.base_dir)
        except Exception:
            rel = path
        return [p for p in rel.parts if p not in (".", "")]

    @staticmethod
    @lru_cache(maxsize=4096)
    def is_hidden_path(path: str) -> bool:
        p = Path(path)
        name = p.name
        if name.startswith(".") and not any(name.endswith(suf) for suf in ALLOWED_HIDDEN_SUFFIXES):
            return True
        return any(part.startswith(".") for part in p.parts)

    @staticmethod
    @lru_cache(maxsize=4096)
    def should_exclude_from_tree(rel_path: str) -> bool:
        if not rel_path or rel_path == ".":
            return False
        parts = Path(rel_path).parts
        return any(part in EXCLUDE_TREE_AND_COPY_DIRS for part in parts)


    @staticmethod
    @lru_cache(maxsize=4096)
    def should_exclude_from_copy(rel_path: str) -> bool:
        if not rel_path or rel_path == ".":
            return False
        parts = Path(rel_path).parts
        return any(part in (EXCLUDE_TREE_AND_COPY_DIRS | EXCLUDE_COPY_ONLY_DIRS) for part in parts)


    def should_exclude_file(self, filename: str) -> bool:
        # استبعاد حسب امتداد / اسم ملف
        # handle filenames like "package-lock.json" (no leading dot)
        lower = filename.lower()
        # direct exact filenames in exclude set
        if lower in (s.lower() for s in self.exclude_copy_extensions):
            return True
        # extension-based check
        ext = Path(filename).suffix
        if ext and ext.lower() in (s.lower() for s in self.exclude_copy_extensions):
            return True
        return False

    def should_add_txt(self, filename: str) -> bool:
        # إذا اسم الملف ينتهي بأي من suffixes المحددة
        return any(filename.endswith(suf) for suf in self.add_txt_on_copy_extensions)

    # -------------------------
    # Utilities
    # -------------------------
    def safe_filename(self, rel_path: Path) -> str:
        """حوّل مسار نسبي إلى اسم ملف واحد مفصّل كما في المواصفات"""
        # استبدال فواصل المسار بـ '_'
        s = "_".join(rel_path.parts)
        return s

    # -------------------------
    # Scan once: build tree_lines + files_to_copy
    # -------------------------
    def scan(self) -> None:
        """يمر مرة واحدة على المجلد لبناء شجرة الملفات وجمع قائمة للنسخ مع الأحجام"""
        base = self.base_dir
        if not base.exists():
            raise FileNotFoundError(f"Base directory '{base}' not found")
        # Walk
        for root, dirs, files in os.walk(base, topdown=True):
            root_path = Path(root)
            rel_root = os.path.relpath(root_path, base)
            # Normalize rel_root
            if rel_root == ".":
                rel_root = "."
            # Apply tree exclude: if directory excluded -> skip descending
            if FastTreeAndCopy.should_exclude_from_tree(rel_root):
                dirs[:] = []  # don't descend
                continue
            # Filter dirs for both traversal and copy decisions
            dirs[:] = [d for d in dirs if not self.should_exclude_from_tree(os.path.join(rel_root, d))]
            # Build tree line for this directory
            level = 0 if rel_root == "." else Path(rel_root).parts.__len__()
            indent = " " * 4 * level
            dir_display = os.path.basename(root) if rel_root != "." else "."
            self.tree_lines.append(f"{indent}{dir_display}")
            # Process files
            for fname in files:
                full_path = root_path / fname
                # hidden check: use path relative to base to see any hidden dir
                rel_file = Path(os.path.relpath(full_path, base))
                if self.is_hidden_path(str(rel_file)):
                    # skip hidden unless allowed by suffixes (handled in is_hidden)
                    continue
                if self.should_exclude_file(fname):
                    continue
                # size (only once here)
                try:
                    size = full_path.stat().st_size
                except OSError:
                    size = 0
                # add to tree
                self.tree_lines.append(f"{indent}    {fname} ({self.format_size(size)})")
                # prepare copy entry
                out_name = self.safe_filename(rel_file)
                # if should convert to .txt (per config), append .txt
                if self.should_add_txt(fname):
                    out_name = out_name + ".txt"
                entry = FileEntry(src=full_path, rel=rel_file, size=size, out_name=out_name)
                self.files_to_copy.append(entry)

    @staticmethod
    def format_size(size_bytes: int) -> str:
        for unit in ['bytes', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                # show integer for bytes, 1 decimal otherwise
                if unit == 'bytes':
                    return f"{int(size_bytes)} {unit}"
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} PB"

    # -------------------------
    # Write tree
    # -------------------------
    def write_tree(self) -> None:
        self.output_tree_file.parent.mkdir(parents=True, exist_ok=True)
        with self.output_tree_file.open("w", encoding="utf-8") as f:
            for line in self.tree_lines:
                f.write(line + "\n")

    # -------------------------
    # Copy files (multithreaded)
    # -------------------------
    def _copy_worker(self, entry: FileEntry, dest_dir: Path, *, copy_metadata: bool = True) -> Tuple[Path, bool, str]:
        """Worker that copies a single file. Returns (dest_path, success, message)."""
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / entry.out_name
        try:
            # copy2 preserves metadata; fallback to copy if not allowed
            if copy_metadata:
                shutil.copy2(entry.src, dest_path)
            else:
                shutil.copy(entry.src, dest_path)
            return dest_path, True, f"Copied: {entry.src} -> {dest_path}"
        except Exception as e:
            return dest_path, False, f"Failed: {entry.src} -> {dest_path} ({e})"

    def copy_all(self, max_workers: int | None = None) -> Dict[str, int]:
        """نسخ كل الملفات باستخدام ThreadPoolExecutor + tqdm.
        max_workers: إذا None سيستخدم os.cpu_count() تلقائياً
        """
        if max_workers is None:
            max_workers = os.cpu_count() or 4

        self.dest_dir.mkdir(parents=True, exist_ok=True)

        total = len(self.files_to_copy)
        copied = 0
        failed = 0

        logger.info(f"Starting copy: {total} files, workers={max_workers}")

        # Use ThreadPoolExecutor to parallelize I/O-bound copying
        with ThreadPoolExecutor(max_workers=max_workers) as ex:
            futures = {ex.submit(self._copy_worker, entry, self.dest_dir): entry for entry in self.files_to_copy}
            # tqdm over as_completed for responsive progress
            for fut in tqdm(as_completed(futures), total=total, unit="file", desc="Copying", ncols=80):
                entry = futures[fut]
                try:
                    dest_path, success, msg = fut.result()
                    if success:
                        copied += 1
                        logger.debug(msg)
                    else:
                        failed += 1
                        logger.warning(msg)
                except Exception as e:
                    failed += 1
                    logger.exception(f"Unhandled exception copying {entry.src}: {e}")

        logger.info(f"Copy finished: {copied} succeeded, {failed} failed")
        return {"total": total, "copied": copied, "failed": failed}

    # -------------------------
    # Run all
    # -------------------------
    def run(self) -> None:
        t0 = perf_counter()
        logger.info("Scanning files (single pass)...")
        self.scan()
        t1 = perf_counter()
        logger.info(f"Scan completed in {t1 - t0:.2f}s — found {len(self.files_to_copy)} files to copy.")
        logger.info("Writing tree file...")
        self.write_tree()
        t2 = perf_counter()
        logger.info(f"Tree written to {self.output_tree_file} ({t2 - t1:.2f}s).")
        # copy with automatic number of workers (CPU cores)
        # res = self.copy_all(max_workers=None)
        # t3 = perf_counter()
        # logger.info(f"All done in {t3 - t0:.2f}s. Summary: {res}")
        # print(f"\n✅ Done! Tree: '{self.output_tree_file}', Copied: {res['copied']}/{res['total']} (failed: {res['failed']})")

# -------------------------
# Run as script
# -------------------------
def main():
    obj = FastTreeAndCopy(
        base_dir=BASE_DIR,
        dest_dir=DEST_DIR,
        output_tree_file=OUTPUT_TREE_FILE,
        exclude_tree_and_copy_dirs=EXCLUDE_TREE_AND_COPY_DIRS,
        exclude_copy_only_dirs=EXCLUDE_COPY_ONLY_DIRS,
        exclude_copy_extensions=EXCLUDE_COPY_EXTENSIONS,
        add_txt_on_copy_extensions=ADD_TXT_ON_COPY_EXTENSIONS,
    )
    obj.run()

if __name__ == "__main__":
    main()
