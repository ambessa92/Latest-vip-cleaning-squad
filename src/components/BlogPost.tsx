import type React from 'react';
import { useEffect, useState } from 'react';
import { getPostById, blogPosts, blogCategories, type BlogPost as BlogPostType } from '../data/blogPosts';

interface BlogPostProps {
  postId: string;
  onNavigate: (page: string) => void;
  onBackToBlog: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ postId, onNavigate, onBackToBlog }) => {
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);

  useEffect(() => {
    const foundPost = getPostById(postId);
    if (foundPost) {
      setPost(foundPost);

      // Find related posts (same category, different article)
      const related = blogPosts
        .filter(p => p.id !== postId && p.category === foundPost.category)
        .slice(0, 3);
      setRelatedPosts(related);

      // Add structured data for the specific blog post
      const postStructuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": foundPost.title,
        "description": foundPost.excerpt,
        "image": foundPost.image,
        "author": {
          "@type": "Person",
          "name": foundPost.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "VIP Cleaning Squad",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/vip-logo.png`
          }
        },
        "datePublished": foundPost.publishedDate,
        "dateModified": foundPost.publishedDate,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${window.location.origin}/#blog/${foundPost.id}`
        },
        "wordCount": foundPost.content.length,
        "timeRequired": `PT${foundPost.readTime}M`,
        "keywords": foundPost.tags.join(", "),
        "articleSection": foundPost.category,
        "inLanguage": "en-US"
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(postStructuredData);
      document.head.appendChild(script);

      // Update page title and meta description
      document.title = foundPost.seoTitle;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', foundPost.metaDescription);
      }

      return () => {
        document.head.removeChild(script);
        document.title = 'VIP Cleaning Squad - Professional Cleaning Services';
      };
    }
  }, [postId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(`${window.location.origin}/#blog/${postId}`);
    const title = encodeURIComponent(post?.title || '');
    const text = encodeURIComponent(post?.excerpt || '');

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}&via=VIPCleaningSquad`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${text}%0A%0A${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been moved.</p>
          <button
            onClick={onBackToBlog}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const category = blogCategories.find(c => c.id === post.category);

  return (
    <article className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>{post.seoTitle}</h1>
        <meta name="description" content={post.metaDescription} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <meta name="author" content={post.author} />
        <meta property="article:published_time" content={post.publishedDate} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={`tag-${tag}`} property="article:tag" content={tag} />
        ))}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <span>›</span>
            <button
              onClick={onBackToBlog}
              className="hover:text-blue-600 transition-colors"
            >
              Blog
            </button>
            <span>›</span>
            <span className="text-gray-900 font-medium">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="mb-6">
              <span className={`inline-flex items-center space-x-2 ${category?.color || 'bg-gray-500'} text-white px-4 py-2 rounded-full text-sm font-medium`}>
                <span>{category?.icon}</span>
                <span>{category?.name}</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">VIP</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{post.author}</div>
                    <div className="text-gray-500 text-sm">VIP Cleaning Squad Expert</div>
                  </div>
                </div>
                <div className="text-gray-500">
                  <div className="font-medium">{formatDate(post.publishedDate)}</div>
                  <div className="text-sm">{post.readTime} minute read</div>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-sm font-medium">Share:</span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  title="Share on Facebook"
                >
                  📘
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
                  title="Share on Twitter"
                >
                  🐦
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                  title="Share on LinkedIn"
                >
                  💼
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="w-10 h-10 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title="Share via Email"
                >
                  📧
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg prose-blue max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-ul:text-gray-700 prose-li:mb-2
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                prose-blockquote:bg-blue-50 prose-blockquote:p-6 prose-blockquote:rounded-r-lg
                prose-blockquote:not-italic prose-blockquote:text-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag) => (
                  <span
                    key={`post-tag-${tag}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Experience VIP Cleaning?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Put our professional expertise to work in your{' '}
              <button
                onClick={() => onNavigate('services')}
                className="underline hover:text-yellow-300 transition-colors"
              >
                home or business
              </button>
              . Get your{' '}
              <button
                onClick={() => onNavigate('quote')}
                className="underline hover:text-yellow-300 transition-colors font-semibold"
              >
                free quote today
              </button>
              !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('quote')}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl"
              >
                Get Free Quote ✨
              </button>
              <a
                href="tel:(289) 697-6559"
                className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg"
              >
                Call (289) 697-6559 📞
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Related Cleaning Tips
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => {
                  const relatedCategory = blogCategories.find(c => c.id === relatedPost.category);
                  return (
                    <article
                      key={`related-${relatedPost.id}`}
                      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        window.location.hash = `#blog/${relatedPost.id}`;
                      }}
                    >
                      <div className={`h-32 bg-gradient-to-br ${relatedCategory?.color || 'bg-gray-500'} relative`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-bold text-white line-clamp-2">
                            {relatedPost.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatDate(relatedPost.publishedDate)}</span>
                          <span>{relatedPost.readTime} min read</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog Button */}
      <div className="py-8 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <button
            onClick={onBackToBlog}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <span>←</span>
            <span>Back to All Articles</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
