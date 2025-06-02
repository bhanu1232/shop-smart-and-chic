
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Award, Globe, Heart, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Navbar from "@/components/Navbar";

const About = () => {
  const navigate = useNavigate();
  useScrollToTop();

  const stats = [
    { label: "Happy Customers", value: "50K+", icon: Users },
    { label: "Products Sold", value: "200K+", icon: Award },
    { label: "Countries", value: "25+", icon: Globe },
    { label: "Years Experience", value: "5+", icon: Heart }
  ];

  const values = [
    {
      title: "Quality First",
      description: "Every product is crafted with premium materials and attention to detail"
    },
    {
      title: "Sustainable Fashion",
      description: "Committed to eco-friendly practices and ethical manufacturing"
    },
    {
      title: "Community Driven",
      description: "Building a global community of style enthusiasts and trendsetters"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200">
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Redefining Street Culture
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Born from the streets, designed for the future. We're more than a brand – we're a movement that celebrates individuality and authenticity.
            </p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3"
            >
              Explore Collection
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-gray-900" />
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We believe that fashion should be a form of self-expression, not conformity. Every piece we create is designed to empower individuals to tell their unique story through style.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  From sustainable materials to ethical manufacturing, we're committed to creating a positive impact on both our community and the planet.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={value.title} className="border-0 shadow-none bg-gray-50 hover:bg-gray-100 transition-colors">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-4 text-gray-900" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join the Movement?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover our latest collection and become part of the Skena.co family
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8"
              onClick={() => navigate('/products')}
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8"
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
