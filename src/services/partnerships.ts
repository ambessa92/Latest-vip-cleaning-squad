// Partnership Management Service for VIP Cleaning Squad

export interface PartnershipLead {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  category: 'Real Estate' | 'Property Management' | 'Home Services' | 'Healthcare' | 'Hospitality' | 'Business Networks' | 'Other';
  partnershipType: 'Referral' | 'Cross-Promotion' | 'Preferred' | 'Strategic';
  description: string;
  location: string;
  status: 'New' | 'Contacted' | 'Meeting Scheduled' | 'Proposal Sent' | 'Active Partner' | 'Declined';
  createdDate: string;
  lastContact?: string;
  notes: string[];
  referralsPotential: 'Low' | 'Medium' | 'High';
  estimatedMonthlyValue: number;
}

export interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
  followUpDays: number;
}

export interface PartnershipOutreach {
  id: string;
  partnershipLeadId: string;
  templateId: string;
  sentDate: string;
  method: 'Email' | 'Phone' | 'In-Person' | 'LinkedIn';
  response?: 'Positive' | 'Negative' | 'No Response';
  responseDate?: string;
  nextFollowUp?: string;
  notes: string;
}

class PartnershipService {
  private leads: PartnershipLead[] = [];
  private outreachHistory: PartnershipOutreach[] = [];

  // Pre-populated potential partners in Niagara region
  private niagaraBusinessDirectory = [
    // Real Estate
    { name: 'Royal LePage Niagara', category: 'Real Estate', location: 'St. Catharines', website: 'https://royallepage.ca', estimatedValue: 2500 },
    { name: 'RE/MAX Escarpment Realty', category: 'Real Estate', location: 'Grimsby', website: 'https://remax.ca', estimatedValue: 2000 },
    { name: 'Century 21 Miller Real Estate', category: 'Real Estate', location: 'Welland', website: 'https://century21.ca', estimatedValue: 1500 },
    { name: 'Keller Williams Niagara', category: 'Real Estate', location: 'Niagara Falls', website: 'https://kw.com', estimatedValue: 2200 },

    // Property Management
    { name: 'Skyline Living', category: 'Property Management', location: 'Multiple', website: 'https://skylineliving.ca', estimatedValue: 5000 },
    { name: 'CLV Group', category: 'Property Management', location: 'Multiple', website: 'https://clvgroup.com', estimatedValue: 4500 },
    { name: 'Effort Trust', category: 'Property Management', location: 'St. Catharines', website: 'https://efforttrust.com', estimatedValue: 3000 },

    // Home Services
    { name: 'Home Depot Niagara', category: 'Home Services', location: 'Multiple', website: 'https://homedepot.ca', estimatedValue: 1800 },
    { name: 'Rona Niagara Falls', category: 'Home Services', location: 'Niagara Falls', website: 'https://rona.ca', estimatedValue: 1200 },
    { name: 'Canadian Tire', category: 'Home Services', location: 'Multiple', website: 'https://canadiantire.ca', estimatedValue: 1000 },

    // Healthcare
    { name: 'Niagara Health System', category: 'Healthcare', location: 'Multiple', website: 'https://niagarahealth.on.ca', estimatedValue: 8000 },
    { name: 'McMaster Family Health', category: 'Healthcare', location: 'St. Catharines', website: '', estimatedValue: 2500 },
    { name: 'Walker Family Health Centre', category: 'Healthcare', location: 'St. Catharines', website: '', estimatedValue: 2000 },

    // Hospitality
    { name: 'Fallsview Casino Resort', category: 'Hospitality', location: 'Niagara Falls', website: 'https://fallsviewcasinoresort.com', estimatedValue: 6000 },
    { name: 'White Oaks Conference Resort', category: 'Hospitality', location: 'Niagara-on-the-Lake', website: 'https://whiteoaksresort.com', estimatedValue: 4000 },
    { name: 'Sheraton on the Falls', category: 'Hospitality', location: 'Niagara Falls', website: 'https://marriott.com', estimatedValue: 5000 },

    // Business Networks
    { name: 'Greater Niagara Chamber of Commerce', category: 'Business Networks', location: 'Niagara Falls', website: 'https://niagarachamber.com', estimatedValue: 500 },
    { name: 'St. Catharines Chamber of Commerce', category: 'Business Networks', location: 'St. Catharines', website: 'https://stcatharines.ca', estimatedValue: 400 },
    { name: 'BNI Niagara', category: 'Business Networks', location: 'Multiple', website: 'https://bni.com', estimatedValue: 800 }
  ];

  // Email templates for outreach
  private emailTemplates: OutreachTemplate[] = [
    {
      id: 'real-estate-intro',
      name: 'Real Estate Agent Introduction',
      subject: 'Partnership Opportunity: Premium Cleaning Services for Your Clients',
      category: 'Real Estate',
      followUpDays: 7,
      content: `
Hi {contactName},

I hope this email finds you well. My name is {senderName} from VIP Cleaning Squad, Niagara's premier cleaning service company.

I'm reaching out because I believe there's a fantastic opportunity for us to work together to better serve your real estate clients.

**What We Offer Your Clients:**
• Professional move-in/move-out cleaning services
• Same-day emergency cleaning for showings
• Competitive rates with real estate agent discounts
• 100% satisfaction guarantee
• Flexible scheduling including evenings and weekends

**Benefits for Your Business:**
• Referral commission on every successful booking
• Enhanced client satisfaction and testimonials
• Value-added service for your listings
• Professional partnership that reflects well on your brand

We currently work with several top realtors in the Niagara region including Royal LePage and RE/MAX, helping them close deals faster and keep clients happy.

Would you be interested in a brief 15-minute call to discuss how we can support your business? I'm confident we can create a mutually beneficial partnership.

Best regards,
{senderName}
VIP Cleaning Squad
(289) 697-6559
info@vipcleaningsquad.ca

P.S. I'd be happy to provide a complimentary cleaning service for one of your current listings as a demonstration of our quality.
      `
    },
    {
      id: 'property-management-intro',
      name: 'Property Management Introduction',
      subject: 'Reliable Cleaning Partner for Your Property Portfolio',
      category: 'Property Management',
      followUpDays: 10,
      content: `
Dear {contactName},

I'm {senderName}, founder of VIP Cleaning Squad, and I'm writing to introduce our comprehensive cleaning services specifically designed for property management companies.

**Our Property Management Solutions:**
• Tenant turnover cleaning and preparation
• Regular maintenance cleaning for common areas
• Emergency cleaning services (24-48 hour turnaround)
• Detailed cleaning reports and documentation
• Competitive bulk pricing for multiple properties

**Why Property Managers Choose VIP:**
• Reliable scheduling that meets your deadlines
• Bonded and insured professional cleaners
• Detailed before/after photo documentation
• 100% satisfaction guarantee
• Preferred vendor pricing agreements

We understand the unique challenges of property management - tight turnarounds, varying property conditions, and the need for consistent quality. Our team is equipped to handle everything from basic turnover cleaning to deep cleaning of neglected properties.

I'd love to schedule a brief meeting to discuss your current cleaning needs and show you how we can streamline your operations while improving tenant satisfaction.

Could we arrange a 20-minute call this week?

Best regards,
{senderName}
VIP Cleaning Squad
(289) 697-6559
info@vipcleaningsquad.ca

Serving: St. Catharines • Niagara Falls • Welland • Grimsby • Lincoln • Thorold • Pelham • Niagara-on-the-Lake
      `
    },
    {
      id: 'home-services-intro',
      name: 'Home Services Partnership',
      subject: 'Cross-Referral Partnership: Cleaning Services for Your Customers',
      category: 'Home Services',
      followUpDays: 7,
      content: `
Hi {contactName},

I'm {senderName} from VIP Cleaning Squad, and I believe our companies could create excellent value for each other's customers.

**The Partnership Opportunity:**
Many of your customers likely need professional cleaning services after renovations, installations, or home improvements. Similarly, our clients often need trusted contractors and home service providers.

**How This Benefits Your Business:**
• Additional revenue stream through referral commissions
• Enhanced customer service by providing complete solutions
• Trusted partner for post-construction cleanup
• Professional relationship that adds value to your brand

**What We Bring to the Partnership:**
• Post-renovation and construction cleanup specialists
• Same-day emergency cleaning services
• Competitive pricing for referred customers
• 100% satisfaction guarantee protecting your reputation

We're already partnering with several contractors and home improvement businesses in the Niagara region, creating win-win situations for everyone involved.

Would you be open to a quick coffee meeting to explore how we can work together?

Best regards,
{senderName}
VIP Cleaning Squad
(289) 697-6559
info@vipcleaningsquad.ca

Licensed • Bonded • Insured • 100% Satisfaction Guaranteed
      `
    }
  ];

  // Create a new partnership lead
  async createPartnershipLead(leadData: Omit<PartnershipLead, 'id' | 'createdDate' | 'notes' | 'status'>): Promise<string> {
    const newLead: PartnershipLead = {
      ...leadData,
      id: `partner-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'New',
      notes: []
    };

    this.leads.push(newLead);
    return newLead.id;
  }

  // Get all partnership leads
  getPartnershipLeads(): PartnershipLead[] {
    return [...this.leads].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }

  // Update lead status
  updateLeadStatus(leadId: string, status: PartnershipLead['status'], notes?: string): void {
    const lead = this.leads.find(l => l.id === leadId);
    if (lead) {
      lead.status = status;
      lead.lastContact = new Date().toISOString().split('T')[0];
      if (notes) {
        lead.notes.push(`${new Date().toISOString().split('T')[0]}: ${notes}`);
      }
    }
  }

  // Generate outreach campaign for a specific category
  generateOutreachCampaign(category: string): Array<{
    businessName: string;
    category: string;
    location: string;
    website: string;
    estimatedMonthlyValue: number;
    outreachPriority: string;
    suggestedTemplate: string;
  }> {
    const potentialPartners = this.niagaraBusinessDirectory
      .filter(business => business.category === category)
      .map(business => ({
        businessName: business.name,
        category: business.category,
        location: business.location,
        website: business.website,
        estimatedMonthlyValue: business.estimatedValue,
        outreachPriority: business.estimatedValue > 3000 ? 'High' :
                          business.estimatedValue > 1500 ? 'Medium' : 'Low',
        suggestedTemplate: this.emailTemplates.find(t => t.category === category)?.id || 'general'
      }));

    return potentialPartners;
  }

  // Send outreach (in a real app, this would integrate with email service)
  async sendOutreach(leadId: string, templateId: string, method: 'Email' | 'Phone' | 'In-Person' | 'LinkedIn'): Promise<string> {
    const outreach: PartnershipOutreach = {
      id: `outreach-${Date.now()}`,
      partnershipLeadId: leadId,
      templateId,
      sentDate: new Date().toISOString().split('T')[0],
      method,
      notes: `Outreach sent via ${method}`
    };

    this.outreachHistory.push(outreach);

    // Update lead status
    this.updateLeadStatus(leadId, 'Contacted', `${method} outreach sent using template ${templateId}`);

    return outreach.id;
  }

  // Get outreach templates
  getOutreachTemplates(): OutreachTemplate[] {
    return this.emailTemplates;
  }

  // Get template by category
  getTemplateByCategory(category: string): OutreachTemplate | undefined {
    return this.emailTemplates.find(t => t.category === category);
  }

  // Analytics and reporting
  getPartnershipAnalytics() {
    const totalLeads = this.leads.length;
    const activePartners = this.leads.filter(l => l.status === 'Active Partner').length;
    const conversionRate = totalLeads > 0 ? (activePartners / totalLeads) * 100 : 0;

    const statusBreakdown = this.leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown = this.leads.reduce((acc, lead) => {
      acc[lead.category] = (acc[lead.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const estimatedMonthlyValue = this.leads
      .filter(l => l.status === 'Active Partner')
      .reduce((sum, l) => sum + l.estimatedMonthlyValue, 0);

    return {
      totalLeads,
      activePartners,
      conversionRate: Math.round(conversionRate * 100) / 100,
      statusBreakdown,
      categoryBreakdown,
      estimatedMonthlyValue,
      averageValuePerPartner: activePartners > 0 ? Math.round(estimatedMonthlyValue / activePartners) : 0
    };
  }

  // Get Niagara business directory for prospecting
  getNiagaraBusinessDirectory() {
    return this.niagaraBusinessDirectory;
  }

  // Backlink opportunity tracker
  generateBacklinkOpportunities() {
    return [
      {
        website: 'Greater Niagara Chamber of Commerce',
        url: 'https://niagarachamber.com',
        linkType: 'Member Directory',
        difficulty: 'Easy',
        value: 'High',
        status: 'Target',
        notes: 'Apply for membership, get listed in member directory'
      },
      {
        website: 'St. Catharines Chamber of Commerce',
        url: 'https://stcatharineschamber.com',
        linkType: 'Business Directory',
        difficulty: 'Easy',
        value: 'High',
        status: 'Target',
        notes: 'Local business directory listing with link'
      },
      {
        website: 'YellowPages.ca',
        url: 'https://yellowpages.ca',
        linkType: 'Business Listing',
        difficulty: 'Easy',
        value: 'Medium',
        status: 'Target',
        notes: 'Comprehensive business profile with backlink'
      },
      {
        website: 'Better Business Bureau',
        url: 'https://bbb.org',
        linkType: 'Accreditation',
        difficulty: 'Medium',
        value: 'High',
        status: 'Target',
        notes: 'Apply for BBB accreditation, get profile link'
      },
      {
        website: 'HomeStars',
        url: 'https://homestars.com',
        linkType: 'Service Provider',
        difficulty: 'Easy',
        value: 'High',
        status: 'Target',
        notes: 'Popular Canadian home service directory'
      },
      {
        website: 'Yelp',
        url: 'https://yelp.ca',
        linkType: 'Business Profile',
        difficulty: 'Easy',
        value: 'Medium',
        status: 'Target',
        notes: 'Comprehensive business profile with photos and reviews'
      },
      {
        website: 'Angie\'s List',
        url: 'https://angieslist.com',
        linkType: 'Service Provider',
        difficulty: 'Easy',
        value: 'Medium',
        status: 'Target',
        notes: 'Trusted home service provider directory'
      },
      {
        website: 'Niagara Region Tourism',
        url: 'https://niagaracanada.com',
        linkType: 'Business Partner',
        difficulty: 'Medium',
        value: 'High',
        status: 'Target',
        notes: 'Partner for Airbnb and vacation rental cleaning'
      }
    ];
  }

  // Local SEO citation opportunities
  generateCitationOpportunities() {
    return [
      { name: 'Google My Business', status: 'Required', priority: 'Critical' },
      { name: 'Bing Places', status: 'Recommended', priority: 'High' },
      { name: 'Apple Maps', status: 'Recommended', priority: 'High' },
      { name: 'Facebook Business', status: 'Recommended', priority: 'High' },
      { name: 'Yellow Pages', status: 'Recommended', priority: 'Medium' },
      { name: 'Canada411', status: 'Recommended', priority: 'Medium' },
      { name: 'Foursquare', status: 'Optional', priority: 'Low' },
      { name: 'TripAdvisor', status: 'Optional', priority: 'Medium' }
    ];
  }
}

// Export singleton instance
export const partnershipService = new PartnershipService();
export default partnershipService;
