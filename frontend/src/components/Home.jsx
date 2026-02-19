import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  FiArrowRight, FiTrendingUp, FiUsers, FiShield, 
  FiStar, FiAward, FiClock, FiGlobe, FiBriefcase,
  FiChevronRight, FiPlay
} from 'react-icons/fi';

const Home = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const features = [
    { 
      icon: <FiTrendingUp />, 
      title: 'Growth Strategy', 
      description: 'Data-driven approaches to scale your business exponentially',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: <FiUsers />, 
      title: 'Expert Team', 
      description: 'Seasoned professionals with industry-leading expertise',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      icon: <FiShield />, 
      title: 'Enterprise Security', 
      description: 'Bank-level security for your valuable data assets',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      icon: <FiStar />, 
      title: 'Quality Assured', 
      description: 'Rigorous testing and quality control processes',
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      icon: <FiAward />, 
      title: 'Award Winning', 
      description: 'Recognized for excellence in digital innovation',
      color: 'from-red-500 to-rose-500'
    },
    { 
      icon: <FiClock />, 
      title: '24/7 Support', 
      description: 'Round-the-clock assistance for your peace of mind',
      color: 'from-indigo-500 to-blue-500'
    },
  ];

  const stats = [
    { value: '500+', label: 'Projects Completed', icon: <FiBriefcase /> },
    { value: '98%', label: 'Client Satisfaction', icon: <FiStar /> },
    { value: '50+', label: 'Expert Team Members', icon: <FiUsers /> },
    { value: '15+', label: 'Industry Awards', icon: <FiAward /> },
  ];

  const testimonials = [
    {
      quote: "This agency transformed our online presence completely. The team's creativity and dedication is unmatched.",
      author: "Sarah Johnson",
      role: "CEO, TechStart",
      rating: 5
    },
    {
      quote: "Working with them was a game-changer. They delivered beyond our expectations and on time.",
      author: "Michael Chen",
      role: "Marketing Director, GrowthCo",
      rating: 5
    },
    {
      quote: "The most professional and creative agency we've ever worked with. Highly recommended!",
      author: "Emily Rodriguez",
      role: "Founder, CreativeLab",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              borderRadius: ["30%", "70%", "30%"]
            }}
            transition={{ 
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          />
        </div>

        {/* Floating Elements */}
        <motion.div 
          style={{ y }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6"
              >
                <FiStar className="mr-2" />
                Trusted by 500+ Companies
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Creative Agency
                </span>
                <br />
                <span className="text-gray-900">That Delivers</span>
                <br />
                <span className="relative">
                  Excellence
                  <motion.span 
                    className="absolute bottom-2 left-0 w-full h-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 -z-10"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                We transform bold ideas into exceptional digital experiences. 
                Let's create something amazing together that sets you apart from the competition.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started
                    <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ opacity: 0.2 }}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold flex items-center justify-center border-2 border-gray-200 hover:border-blue-600 transition-colors"
                >
                  <FiPlay className="mr-2 text-blue-600" />
                  Watch Demo
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                {stats.slice(0, 4).map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[600px]">
                {/* Main Card */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-20 right-20 w-72 h-96 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                  <div className="relative p-6 text-white">
                    <FiStar className="text-3xl mb-4" />
                    <h3 className="text-xl font-bold mb-2">Creative Design</h3>
                    <p className="text-sm opacity-90">Innovative solutions tailored to your brand</p>
                  </div>
                </motion.div>

                {/* Secondary Card */}
                <motion.div
                  animate={{ 
                    y: [0, -30, 0],
                  }}
                  transition={{ 
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute top-40 left-20 w-64 h-80 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                  <div className="relative p-6 text-white">
                    <FiUsers className="text-3xl mb-4" />
                    <h3 className="text-xl font-bold mb-2">Expert Team</h3>
                    <p className="text-sm opacity-90">Dedicated professionals at your service</p>
                  </div>
                </motion.div>

                {/* Third Card */}
                <motion.div
                  animate={{ 
                    y: [0, -25, 0],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="absolute bottom-20 right-40 w-56 h-72 bg-gradient-to-br from-pink-600 to-orange-600 rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                  <div className="relative p-6 text-white">
                    <FiTrendingUp className="text-3xl mb-4" />
                    <h3 className="text-xl font-bold mb-2">Growth</h3>
                    <p className="text-sm opacity-90">Data-driven strategies for success</p>
                  </div>
                </motion.div>

                {/* Floating Particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                    style={{
                      left: `${20 + i * 10}%`,
                      top: `${10 + i * 8}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2 + i,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              We Deliver{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Excellence
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of services ensures your business stands out in the digital landscape
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                
                {/* Learn More Link */}
                <motion.a 
                  href="#"
                  className="inline-flex items-center text-blue-600 font-semibold"
                  whileHover={{ x: 5 }}
                >
                  Learn More
                  <FiChevronRight className="ml-1" />
                </motion.a>

                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-bl-full" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center text-white"
              >
                <div className="text-4xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-4xl sm:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6">
              What Our{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Clients Say
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Journey?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Let's transform your ideas into reality. Get in touch with us today.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Get Started Now
              <FiArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </span>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
              style={{ opacity: 0.2 }}
            />
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;