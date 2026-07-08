import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Vote, CheckCircle, BarChart3, Users, TrendingUp, AlertCircle, Lock, Sparkles, Loader2 } from 'lucide-react';
import { pollService } from '@/services/poll.service';

interface PollOption {
  id: string;
  text: string;
  textFr?: string;
  textAr?: string;
  _count?: { votes: number };
}

interface Poll {
  id: string;
  question: string;
  questionFr?: string;
  questionAr?: string;
  options: PollOption[];
  startAt: string;
  endAt: string;
  visibility: string;
  status: string;
  createdAt: string;
  _count?: { votes: number };
}

const Polls = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    fetchPolls();
  }, []);

  useEffect(() => {
    if (isAuthenticated && polls.length > 0) {
      fetchUserVotes();
    }
  }, [isAuthenticated, polls]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await pollService.getAllPolls();
      const pollsData = response.data || [];
      
      // Check if polls have expired and update status
      const now = new Date();
      const updatedPolls = pollsData.map((poll: Poll) => {
        const endDate = new Date(poll.endAt);
        // If current date is past end date and status is still ACTIVE, mark as CLOSED
        if (endDate < now && poll.status === 'ACTIVE') {
          return { ...poll, status: 'CLOSED' };
        }
        return poll;
      });
      
      setPolls(updatedPolls);
    } catch (error: any) {
      console.error('Error fetching polls:', error);
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const votes: Record<string, string> = {};
      for (const poll of polls) {
        const response = await pollService.getUserVote(poll.id);
        if (response.data) {
          votes[poll.id] = response.data.optionId;
        }
      }
      setUserVotes(votes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    // Check if poll has ended
    const poll = polls.find(p => p.id === pollId);
    if (poll) {
      const endDate = new Date(poll.endAt);
      const now = new Date();
      if (endDate < now || poll.status !== 'ACTIVE') {
        toast.error('This poll has ended');
        return;
      }
    }

    if (userVotes[pollId]) {
      toast.error('You have already voted on this poll');
      return;
    }

    try {
      await pollService.vote(pollId, optionId);
      
      // Update local state
      setUserVotes(prev => ({ ...prev, [pollId]: optionId }));
      
      // Refresh polls to get updated counts
      await fetchPolls();
      
      toast.success(t.polls.votedSuccess);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit vote');
    }
  };

  const totalPolls = polls.length;
  const activePolls = polls.filter(p => p.status === 'ACTIVE').length;
  const totalVotesAllPolls = polls.reduce((sum, poll) => {
    const pollVotes = poll.options?.reduce((s, opt) => s + (opt._count?.votes || 0), 0) || 0;
    return sum + pollVotes;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <div className="container mx-auto px-4 relative z-10 pt-40 pb-16 md:pt-48 md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-6"
          >
            Have your say
          </motion.p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-black uppercase text-foreground leading-[0.9] tracking-tight text-6xl md:text-8xl"
            >
              Your voice<br />
              <span className="gradient-text">matters.</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="max-w-md"
            >
              <p dir="rtl" className="font-display font-bold text-xl text-muted-foreground/70 mb-3">
                صوتك يصنع القرار
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Vote on the questions shaping the academy. Every ballot is counted, every opinion lands.
              </p>
            </motion.div>
          </div>

          {/* Inline stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-foreground/10 grid grid-cols-3 gap-8 max-w-xl"
          >
            {[
              { label: 'Total Polls', value: totalPolls },
              { label: 'Active Polls', value: activePolls },
              { label: 'Total Votes', value: totalVotesAllPolls },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-black text-3xl md:text-4xl text-foreground">
                  {stat.value}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Authentication Alert */}
      {!isAuthenticated && (
        <div className="container mx-auto px-4 max-w-4xl mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <Lock className="h-5 w-5 text-orange-500" />
              <AlertDescription className="text-base ml-2">
                <strong>Login required:</strong> Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold underline hover:text-primary"
                >
                  sign in
                </button>{' '}
                to participate in polls and see results.
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      )}

      {/* Polls Section */}
      <div className="container mx-auto px-4 max-w-4xl py-16">

        <div className="space-y-8">
          {polls.map((poll, index) => {
            const displayQuestion =
              language === 'fr'
                ? poll.questionFr
                : language === 'ar'
                  ? poll.questionAr
                  : poll.question;
            const hasVoted = userVotes[poll.id];
            const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt._count?.votes || 0), 0) || 0;
            
            // Check if poll has ended
            const endDate = new Date(poll.endAt);
            const now = new Date();
            const isPollEnded = endDate < now || poll.status !== 'ACTIVE';

            return (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-8 shadow-xl border-2 hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
                  {/* Gradient Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                  
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                    >
                      <Vote className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">
                        {displayQuestion || poll.question}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {totalVotes} votes
                        </span>
                        <Badge variant={isPollEnded ? 'secondary' : 'default'}>
                          {isPollEnded ? 'CLOSED' : poll.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {poll.options?.map((option, optIndex) => {
                      const displayText =
                        language === 'fr'
                          ? option.textFr
                          : language === 'ar'
                            ? option.textAr
                            : option.text;
                      const optionVotes = option._count?.votes || 0;
                      const percentage =
                        totalVotes > 0 ? (optionVotes / totalVotes) * 100 : 0;
                      const isSelected = userVotes[poll.id] === option.id;

                      return (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + optIndex * 0.05 }}
                        >
                          {hasVoted || !isAuthenticated || isPollEnded ? (
                            <div className="space-y-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-base font-medium flex items-center gap-2">
                                  {displayText || option.text}
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 200 }}
                                    >
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                    </motion.div>
                                  )}
                                </span>
                                <span className="text-base font-semibold text-primary">
                                  {optionVotes} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="relative h-3 bg-background rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full justify-start text-base h-auto py-4 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:border-primary transition-all group"
                              onClick={() => handleVote(poll.id, option.id)}
                            >
                              <span className="flex-1 text-left">{displayText || option.text}</span>
                              <TrendingUp className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {!hasVoted && isAuthenticated && !isPollEnded && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-muted-foreground mt-6 text-center flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Click an option to cast your vote
                    </motion.p>
                  )}
                  
                  {isPollEnded && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-muted-foreground mt-6 text-center flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      This poll has ended
                    </motion.p>
                  )}

                  {!isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg"
                    >
                      <p className="text-sm text-center flex items-center justify-center gap-2">
                        <Lock className="h-4 w-4 text-orange-500" />
                        <span>Login to vote and see full results</span>
                      </p>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Polls;