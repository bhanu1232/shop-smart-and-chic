
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Award, Globe, Heart, ShoppingCart, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { label: "Happy Customers", value: "50K+", icon: Users },
    { label: "Products Sold", value: "200K+", icon: Award },
    { label: "Countries", value: "25+", icon: Globe },
    { label: "Years Experience", value: "5+", icon: Heart }
  ];

  const team = [
    {
      name: "Alex Rodriguez",
      role: "Founder & CEO",
      image: "/placeholder.svg",
      bio: "Passionate about bringing premium streetwear to everyone"
    },
    {
      name: "Sarah Chen",
      role: "Head of Design",
      image: "/placeholder.svg",
      bio: "Creating innovative designs that define modern street culture"
    },
    {
      name: "Marcus Johnson",
      role: "Operations Director",
      image: "/placeholder.svg",
      bio: "Ensuring quality and sustainability in every product"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              Skena.co
            </h1>
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => navigate('/')} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</button>
              <button onClick={() => navigate('/products')} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Products</button>
              <button onClick={() => navigate('/about')} className="text-gray-900 font-bold">About</button>
            </nav>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button className="bg-gray-900 hover:bg-gray-800">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Redefining
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Street Culture
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Born from the streets, designed for the future. We're more than a brand – we're a movement that celebrates individuality and authenticity.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card 
                key={stat.label}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <stat.icon className="h-12 w-12 mx-auto mb-4 text-gray-900" />
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We believe that fashion should be a form of self-expression, not conformity. Every piece we create is designed to empower individuals to tell their unique story through style.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  From sustainable materials to ethical manufacturing, we're committed to creating a positive impact on both our community and the planet.
                </p>
                <Button 
                  className="bg-gray-900 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
                  onClick={() => navigate('/products')}
                >
                  Shop Our Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The creative minds behind Skena.co, united by passion for innovation and style
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card 
                key={member.name}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-gray-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Movement?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover our latest collection and become part of the Skena.co family
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/products')}
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-300"
            >
              Follow Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
