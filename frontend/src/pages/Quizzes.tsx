import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, Lock, Play, CheckCircle, Brain } from 'lucide-react';
import quizService, { Quiz, QuizAttempt } from '../services/quiz.service';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { HeroParticles } from '@/components/HeroParticles';
import { Footer } from '@/components/Footer';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<{ [key: string]: QuizAttempt | null }>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'ACTIVE' | 'CLOSED'>('ALL');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);

      // Check attempts for each quiz
      const attemptPromises = data.map(async (quiz) => {
        try {
          const attemptData = await quizService.checkUserAttempt(quiz.id);
          return { quizId: quiz.id, attempt: attemptData.hasAttempted ? attemptData.attempt : null };
        } catch (error) {
          return { quizId: quiz.id, attempt: null };
        }
      });

      const attemptResults = await Promise.all(attemptPromises);
      const attemptsMap = attemptResults.reduce((acc, { quizId, attempt }) => {
        acc[quizId] = attempt || null;
        return acc;
      }, {} as { [key: string]: QuizAttempt | null });

      setAttempts(attemptsMap);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch quizzes',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    filter === 'ALL' ? true : quiz.status === filter
  );

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      UPCOMING: 'secondary',
      ACTIVE: 'default',
      CLOSED: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handlePlayQuiz = (quizId: string) => {
    navigate(`/quizzes/${quizId}/play`);
  };

  const handleViewResults = (quizId: string) => {
    navigate(`/quizzes/${quizId}/leaderboard`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden -mt-[4.5rem] gradient-hero noise">
        <HeroParticles variant="section" id="hero-particles-quizzes" />
        <div className="container mx-auto px-4 relative z-10 pt-40 pb-16 md:pt-48 md:pb-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-label mb-6"
          >
            Test your knowledge
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black uppercase text-foreground leading-[0.9] tracking-tight text-6xl md:text-8xl"
          >
            <span className="gradient-text">Quizzes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-muted-foreground leading-relaxed max-w-xl mt-6 text-lg"
          >
            Compete with fellow members, put your civic and political knowledge to the test.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {['ALL', 'UPCOMING', 'ACTIVE', 'CLOSED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setFilter(status as any)}
            >
              {status}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="py-24 text-center">
            <Brain className="w-14 h-14 mx-auto text-muted-foreground mb-6 opacity-40" />
            <h3 className="font-display font-black uppercase tracking-tight text-3xl mb-2">No quizzes yet.</h3>
            <p className="text-muted-foreground">Check back later for new quizzes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz, index) => {
              const attempt = attempts[quiz.id];
              const hasAttempted = !!attempt;

              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col rounded-3xl shadow-card hover:shadow-glow transition-all overflow-hidden">
                    {quiz.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={quiz.coverImage}
                          alt={quiz.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          {getStatusBadge(quiz.status)}
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      {!quiz.coverImage && (
                        <div className="flex justify-end mb-2">
                          {getStatusBadge(quiz.status)}
                        </div>
                      )}
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(quiz.startAt).toLocaleDateString()} - {new Date(quiz.endAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(quiz.timeLimit / 60)} minutes</span>
                        </div>
                        {hasAttempted && attempt && (
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="h-4 w-4" />
                            <span>Score: {attempt.totalScore} points</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {quiz.status === 'UPCOMING' && (
                        <Button disabled className="w-full rounded-full" variant="outline">
                          <Lock className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      )}
                      {quiz.status === 'ACTIVE' && !hasAttempted && (
                        <Button onClick={() => handlePlayQuiz(quiz.id)} className="w-full rounded-full gradient-primary shadow-glow">
                          <Play className="mr-2 h-4 w-4" />
                          Play Quiz
                        </Button>
                      )}
                      {quiz.status === 'ACTIVE' && hasAttempted && (
                        <Button onClick={() => handleViewResults(quiz.id)} className="w-full rounded-full" variant="outline">
                          <Trophy className="mr-2 h-4 w-4" />
                          View Leaderboard
                        </Button>
                      )}
                      {quiz.status === 'CLOSED' && (
                        <Button onClick={() => handleViewResults(quiz.id)} className="w-full rounded-full" variant="outline">
                          <Trophy className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Quizzes;
