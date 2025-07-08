import type React from 'react';
import { useState, useEffect } from 'react';
import { blogPosts, blogCategories, getFeaturedPosts, getPostsByCategory, searchPosts, getAllTags, type BlogPost, type BlogCategory } from '../data/blogPosts';

interface BlogProps {
  onNavigate: (page: string) => void;
  onPostSelect?: (postId: string) => void;
}

const Blog: React.FC<BlogProps> = ({ onNavigate, onPostSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>(blogPosts);

  // SEO structured data for blog
  useEffect(() => {
    const blogStructuredData = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "VIP Cleaning Squad Blog",
      "description": "Professional cleaning tips, guides, and advice from VIP Cleaning Squad experts. Learn how to maintain a spotless home and workspace.",
      "url": `${window.location.origin}/#blog`,
      "author": {
        "@type": "Organization",
        "name": "VIP Cleaning Squad"
      },
      "blogPost": blogPosts.map(post => ({
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt,
        "author": {
          "@type": "Person",
          "name": post.author
        },
        "datePublished": post.publishedDate,
        "url": `${window.location.origin}/#blog/${post.id}`,
        "wordCount": post.content.length,
        "timeRequired": `PT${post.readTime}M`
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(blogStructuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Filter posts based on category and search
  useEffect(() => {
    let filtered = blogPosts;

    if (selectedCategory !== 'all') {
      filtered = getPostsByCategory(selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = searchPosts(searchQuery).filter(post =>
        selectedCategory === 'all' || post.category === selectedCategory
      );
    }

    setDisplayedPosts(filtered);
  }, [selectedCategory, searchQuery]);

  const handlePostClick = (postId: string) => {
    if (onPostSelect) {
      onPostSelect(postId);
    } else {
      // Default navigation
      window.location.hash = `#blog/${postId}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const featuredPosts = getFeaturedPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>VIP Cleaning Squad Blog - Professional Cleaning Tips & Guides</h1>
        <meta name="description" content="Expert cleaning advice, tips, and guides from VIP Cleaning Squad. Learn eco-friendly cleaning, deep cleaning techniques, and professional maintenance strategies." />
        <meta name="keywords" content="cleaning tips, professional cleaning, eco-friendly cleaning, deep cleaning, home maintenance, commercial cleaning, cleaning guides" />
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              VIP Cleaning{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                Expert Tips
              </span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Professional cleaning advice, eco-friendly solutions, and maintenance strategies from Niagara's trusted cleaning experts
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cleaning tips, guides, and advice..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-yellow-300">{blogPosts.length}+</div>
                <div className="text-blue-200">Expert Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-green-300">{blogCategories.length}</div>
                <div className="text-blue-200">Categories</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
                <div className="text-2xl font-bold text-purple-300">{getAllTags().length}+</div>
                <div className="text-blue-200">Topics Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Articles ({blogPosts.length})
            </button>
            {blogCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? `${category.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name} ({getPostsByCategory(category.id).length})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {selectedCategory === 'all' && !searchQuery && (
        <section className="py-16 bg-gradient-to-r from-yellow-50 to-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              ⭐ Featured Cleaning Guides
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {featuredPosts.map((post) => (
                <article
                  key={`featured-${post.id}`}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                        ⭐ Featured
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`${blogCategories.find(c => c.id === post.category)?.color} w-3 h-3 rounded-full`} />
                        <span className="text-gray-600 text-sm capitalize">{post.category}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{post.readTime} min read</span>
                    </div>
                    <p className="text-gray-700 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">{formatDate(post.publishedDate)}</span>
                      <span className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                        Read More →
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Articles Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600 mt-2">
                Found {displayedPosts.length} article{displayedPosts.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {displayedPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Found</h3>
              <p className="text-gray-600 mb-8">
                Try adjusting your search terms or browse a different category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Show All Articles
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map((post) => {
                const category = blogCategories.find(c => c.id === post.category);
                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    onClick={() => handlePostClick(post.id)}
                  >
                    <div className={`h-40 bg-gradient-to-br ${category?.color || 'bg-gray-500'} relative`}>
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                          {category?.icon} {category?.name}
                        </span>
                      </div>
                      {post.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-xs font-bold">
                            ⭐ Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{formatDate(post.publishedDate)}</span>
                        <span>{post.readTime} min read</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={`${post.id}-tag-${tag}`}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated with VIP Cleaning Tips</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Get the latest cleaning tips, seasonal guides, and exclusive offers delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300"
            />
            <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for Professional Cleaning?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Put our expertise to work in your home or business.
            <button
              onClick={() => onNavigate('quote')}
              className="text-yellow-400 hover:text-yellow-300 underline ml-1"
            >
              Get your free quote today
            </button>
            !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('quote')}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-xl"
            >
              Get Free Quote ✨
            </button>
            <a
              href="tel:(289) 697-6559"
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-gray-900 transition-all font-semibold text-lg"
            >
              Call (289) 697-6559 📞
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
