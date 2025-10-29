import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Video, BookOpen, Wrench, Lock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-purple.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Welcome to Alma101 Hackings - your premier online platform for mastering cybersecurity and hacking techniques.
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Cybersecurity setup" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hero Content Card */}
            <Card className="bg-gradient-to-br from-card to-muted border-primary/30 shadow-[0_0_40px_hsl(var(--cyber-glow)/0.3)]">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-foreground">
                  Leading Cyber Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  Protecting your digital assets is our top priority. At Alma101 Hackings, we offer cutting-edge solutions to safeguard your business from cyber threats. Our team of experts is dedicated to providing top-notch security services tailored to your needs.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--cyber-glow))] transition-all"
                >
                  <Link to="/auth">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Subheading */}
          <div className="text-center mt-16">
            <p className="text-lg md:text-xl text-muted-foreground italic max-w-4xl mx-auto">
              Stay updated on the latest cybersecurity trends and upcoming events to stay ahead in the ever-evolving world of cybersecurity and hacking.
            </p>
          </div>
        </div>
      </section>

      {/* Stay Ahead Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stay Ahead with <span className="text-primary">Alma101 Hackings</span>
          </h2>
          <div className="flex items-center justify-center gap-2 text-accent">
            <TrendingUp className="h-6 w-6" />
            <p className="text-xl">Continuous Learning • Expert Resources • Community Support</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What We <span className="text-primary">Offer</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to become a cybersecurity expert
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Video className="h-10 w-10 text-primary" />
                  <CardTitle className="text-foreground">Hacking Videos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Learn from expert tutorials covering penetration testing, network security, and advanced hacking techniques.
                </CardDescription>
                <Button asChild variant="link" className="text-primary mt-4 p-0">
                  <Link to="/videos">
                    Explore Videos <Lock className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-10 w-10 text-primary" />
                  <CardTitle className="text-foreground">Security Blogs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Stay updated with the latest cybersecurity trends, vulnerabilities, and best practices from industry experts.
                </CardDescription>
                <Button asChild variant="link" className="text-primary mt-4 p-0">
                  <Link to="/blogs">
                    Read Blogs <Lock className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_30px_hsl(var(--cyber-glow)/0.3)] hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Wrench className="h-10 w-10 text-primary" />
                  <CardTitle className="text-foreground">Hacking Tools</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  Access curated collection of essential penetration testing and security assessment tools.
                </CardDescription>
                <Button asChild variant="link" className="text-primary mt-4 p-0">
                  <Link to="/tools">
                    View Tools <Lock className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-card via-muted to-card border-primary/50 max-w-4xl mx-auto">
            <CardHeader className="text-center pb-8">
              <Shield className="h-16 w-16 text-primary mx-auto mb-4 drop-shadow-[0_0_20px_hsl(var(--cyber-glow))]" />
              <CardTitle className="text-3xl md:text-4xl text-foreground mb-4">
                Ready to Start Your Journey?
              </CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Join our community of ethical hackers and cybersecurity professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Button 
                asChild 
                size="lg"
                className="bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--cyber-glow))]"
              >
                <Link to="/auth">Create Free Account</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required • Instant access • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-primary/20">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="mb-2 font-medium text-foreground">Alma101 Hackings</p>
          <p className="text-sm italic">Legends Never Die</p>
          <p className="text-xs mt-4">&copy; 2024 Alma101 Hackings. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;