'use client';

import {
  Loader2,
  ThumbsUp,
  ThumbsDown,
  GitPullRequest,
  ExternalLink,
  Calendar,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AssetRequest {
  id: string;
  title: string;
  description: string;
  type: string;
  deliveryType: string;
  estimatedPrice: number;
  sourceUrl: string;
  status: string;
  upvotes: number;
  downvotes: number;
  score: number;
  createdAt: string;
  thumbnail?: string | null;
  user: {
    firstName: string | null;
    email: string;
  };
}

export default function RequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/asset-requests?voting=true');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleVote = async (id: string, type: 'UPVOTE' | 'DOWNVOTE') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote on asset requests',
        variant: 'destructive',
      });
      return;
    }

    setVotingId(id);
    try {
      const res = await fetch(`/api/asset-requests/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType: type }),
      });

      if (res.ok) {
        toast({
          title: 'Vote Recorded',
          description: `You ${type.toLowerCase()}d this request`,
        });
        fetchRequests();
      } else {
        const error = await res.json();
        toast({
          title: 'Vote Failed',
          description: error.error || 'Failed to vote',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process vote',
        variant: 'destructive',
      });
    } finally {
      setVotingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                <span>Community Voting</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Vote on <span className="text-gradient">Asset Requests</span>
              </h1>
              <p className="text-muted-foreground">
                Help decide which digital assets should be added to the platform next. Upvote the
                requests you&apos;d like to see funded.
              </p>
            </div>
            <Link href="/request">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-500/30 button-glow"
              >
                <GitPullRequest className="w-5 h-5 mr-2" />
                Submit Request
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-custom py-8">
        {requests.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <GitPullRequest className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Votes</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                There are currently no asset requests open for voting. Be the first to submit a
                request!
              </p>
              <Link href="/request">
                <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Submit a Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <Card key={req.id} className="flex flex-col border-2 card-hover overflow-hidden">
                {/* Card Header */}
                <CardHeader className="p-0">
                  {req.thumbnail ? (
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={req.thumbnail}
                        alt={req.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 left-3 right-3 flex justify-between">
                        <Badge
                          variant="secondary"
                          className="backdrop-blur-sm bg-black/50 text-white border-0"
                        >
                          {req.type}
                        </Badge>
                        <Badge className="backdrop-blur-sm bg-green-500/90 text-white border-0">
                          ${req.estimatedPrice.toFixed(0)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
                      <GitPullRequest className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-5 flex-1">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{req.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {req.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>by {req.user.firstName || 'Community Member'}</span>
                  </div>

                  {req.sourceUrl && (
                    <a
                      href={req.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-0 border-t bg-muted/20">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(req.id, 'UPVOTE')}
                        disabled={votingId === req.id}
                        className="hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30"
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${votingId === req.id ? 'animate-pulse' : ''}`}
                        />
                        <span className="ml-1">{req.upvotes}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(req.id, 'DOWNVOTE')}
                        disabled={votingId === req.id}
                        className="hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30"
                      >
                        <ThumbsDown
                          className={`w-4 h-4 ${votingId === req.id ? 'animate-pulse' : ''}`}
                        />
                        <span className="ml-1">{req.downvotes}</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <TrendingUp
                        className={`w-4 h-4 ${req.score > 0 ? 'text-green-500' : req.score < 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                      />
                      <span
                        className={`text-sm font-bold ${req.score > 0 ? 'text-green-600' : req.score < 0 ? 'text-red-600' : 'text-muted-foreground'}`}
                      >
                        {req.score > 0 ? '+' : ''}
                        {req.score}
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      {requests.length > 0 && (
        <section className="border-t bg-muted/30 py-12">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border bg-background">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">Vote for Assets</h3>
                  <p className="text-sm text-muted-foreground">
                    Upvote the asset requests you&apos;d like to see added to the platform. Popular
                    requests get priority.
                  </p>
                </CardContent>
              </Card>

              <Card className="border bg-background">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">Submit Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t see what you&apos;re looking for? Submit a request for any digital
                    asset you&apos;d like the community to fund together.
                  </p>
                </CardContent>
              </Card>

              <Card className="border bg-background">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch as your favorite requests gain votes and get approved for funding.
                    High-scoring requests are added faster.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
