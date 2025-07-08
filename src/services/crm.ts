// CRM Service for Lead Management and Customer Relationship Management
export interface Lead {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  source: 'Website' | 'Phone' | 'Referral' | 'Google Ads' | 'Social Media';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Closed Won' | 'Closed Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  serviceType: 'Residential' | 'Commercial' | 'Airbnb' | 'Move-in/out' | 'Deep Clean';
  estimatedValue: number;
  notes: string;
  createdDate: string;
  lastActivity: string;
  nextFollowUp?: string;
  assignedTo: string;
  tags: string[];
  customFields: Record<string, any>;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Quote Sent' | 'Service Completed' | 'Follow-up' | 'Note';
  description: string;
  date: string;
  performedBy: string;
  outcome?: string;
}

export interface CRMStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageDealValue: number;
  monthlyRevenue: number;
  pipelineValue: number;
}

class CRMService {
  private leads: Lead[] = [
    {
      id: 'lead-001',
      email: 'mike.wilson@email.com',
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '(905) 555-0123',
      address: '789 Elm St, St. Catharines, ON',
      source: 'Website',
      status: 'Qualified',
      priority: 'High',
      serviceType: 'Commercial',
      estimatedValue: 2500,
      notes: 'Office building - 5000 sq ft, looking for weekly service',
      createdDate: '2024-12-08',
      lastActivity: '2024-12-10',
      nextFollowUp: '2024-12-12',
      assignedTo: 'Fin Clarke',
      tags: ['Commercial', 'Weekly Service', 'Large Account'],
      customFields: {
        squareFootage: 5000,
        buildingType: 'Office',
        currentProvider: 'None'
      }
    },
    {
      id: 'lead-002',
      email: 'jennifer.brown@email.com',
      firstName: 'Jennifer',
      lastName: 'Brown',
      phone: '(289) 555-0789',
      address: '321 Pine St, Niagara Falls, ON',
      source: 'Google Ads',
      status: 'Proposal Sent',
      priority: 'Medium',
      serviceType: 'Residential',
      estimatedValue: 450,
      notes: '3 bedroom house, deep clean requested for move-in',
      createdDate: '2024-12-09',
      lastActivity: '2024-12-10',
      nextFollowUp: '2024-12-13',
      assignedTo: 'Fin Clarke',
      tags: ['Move-in', 'Deep Clean', 'New Customer'],
      customFields: {
        bedrooms: 3,
        bathrooms: 2,
        urgency: 'Within 1 week'
      }
    }
  ];

  private activities: Activity[] = [
    {
      id: 'act-001',
      leadId: 'lead-001',
      type: 'Call',
      description: 'Initial consultation call - discussed weekly office cleaning needs',
      date: '2024-12-08',
      performedBy: 'Fin Clarke',
      outcome: 'Interested - scheduling site visit'
    },
    {
      id: 'act-002',
      leadId: 'lead-002',
      type: 'Quote Sent',
      description: 'Deep cleaning quote sent via email - $450 for 3BR house',
      date: '2024-12-10',
      performedBy: 'Fin Clarke'
    }
  ];

  // Create new lead from quote form
  async createLead(formData: Record<string, any>): Promise<{ success: boolean; leadId?: string; error?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        email: formData.email as string,
        firstName: (formData.firstName || (formData.name as string)?.split(' ')[0]) as string || '',
        lastName: (formData.lastName || (formData.name as string)?.split(' ')[1]) as string || '',
        phone: formData.phone as string,
        address: formData.address as string,
        source: 'Website',
        status: 'New',
        priority: this.calculatePriority(formData),
        serviceType: formData.propertyType === 'residential' ? 'Residential' : 'Commercial',
        estimatedValue: this.calculateEstimatedValue(formData),
        notes: this.generateInitialNotes(formData),
        createdDate: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        assignedTo: 'Fin Clarke',
        tags: this.generateTags(formData),
        customFields: this.extractCustomFields(formData)
      };

      this.leads.push(newLead);

      return { success: true, leadId: newLead.id };
    } catch (error) {
      return { success: false, error: 'Failed to create lead' };
    }
  }

  // Get all leads with filtering
  getLeads(filters?: {
    status?: string;
    priority?: string;
    serviceType?: string;
    assignedTo?: string;
  }): Lead[] {
    let filteredLeads = [...this.leads];

    if (filters) {
      if (filters.status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
      }
      if (filters.priority) {
        filteredLeads = filteredLeads.filter(lead => lead.priority === filters.priority);
      }
      if (filters.serviceType) {
        filteredLeads = filteredLeads.filter(lead => lead.serviceType === filters.serviceType);
      }
      if (filters.assignedTo) {
        filteredLeads = filteredLeads.filter(lead => lead.assignedTo === filters.assignedTo);
      }
    }

    return filteredLeads.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
  }

  // Update lead status
  async updateLeadStatus(leadId: string, status: Lead['status'], notes?: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const leadIndex = this.leads.findIndex(lead => lead.id === leadId);
    if (leadIndex === -1) return { success: false };

    this.leads[leadIndex].status = status;
    this.leads[leadIndex].lastActivity = new Date().toISOString().split('T')[0];

    return { success: true };
  }

  // Get CRM statistics
  getCRMStats(): CRMStats {
    const totalLeads = this.leads.length;
    const newLeads = this.leads.filter(lead => lead.status === 'New').length;
    const qualifiedLeads = this.leads.filter(lead => lead.status === 'Qualified').length;
    const closedWon = this.leads.filter(lead => lead.status === 'Closed Won').length;

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      conversionRate: totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0,
      averageDealValue: Math.round(this.leads.reduce((sum, lead) => sum + lead.estimatedValue, 0) / totalLeads),
      monthlyRevenue: this.leads
        .filter(lead => lead.status === 'Closed Won')
        .reduce((sum, lead) => sum + lead.estimatedValue, 0),
      pipelineValue: this.leads
        .filter(lead => ['Qualified', 'Proposal Sent'].includes(lead.status))
        .reduce((sum, lead) => sum + lead.estimatedValue, 0)
    };
  }

  // Get activities for a lead
  getActivities(leadId: string): Activity[] {
    return this.activities
      .filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Add activity to lead
  async addActivity(leadId: string, activityData: Omit<Activity, 'id' | 'leadId' | 'date'>): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const activity: Activity = {
      id: `act-${Date.now()}`,
      leadId,
      date: new Date().toISOString().split('T')[0],
      ...activityData
    };

    this.activities.push(activity);

    return { success: true };
  }

  // Private helper methods
  private calculatePriority(formData: Record<string, any>): Lead['priority'] {
    if (formData.propertyType === 'commercial' ||
        (formData.bedrooms && Number.parseInt(formData.bedrooms as string) >= 4)) {
      return 'High';
    }
    return 'Medium';
  }

  private calculateEstimatedValue(formData: Record<string, any>): number {
    if (formData.propertyType === 'commercial') {
      const sqft = Number.parseInt(formData.squareFootage as string) || 2000;
      return Math.round(sqft * 0.15 * 12);
    }

    const bedrooms = Number.parseInt(formData.bedrooms as string) || 2;
    const bathrooms = Number.parseInt(formData.bathrooms as string) || 1;
    const basePrice = 120 + (bedrooms * 15) + (bathrooms * 20);

    const frequencyMultiplier = formData.frequency === 'weekly' ? 52 :
                               formData.frequency === 'biWeekly' ? 26 : 12;

    return Math.round(basePrice * frequencyMultiplier * 0.85);
  }

  private generateInitialNotes(formData: Record<string, any>): string {
    const notes = [];

    if (formData.propertyType === 'residential') {
      notes.push(`${formData.bedrooms || 'N/A'} bedrooms, ${formData.bathrooms || 'N/A'} bathrooms`);
    } else {
      notes.push(`${formData.squareFootage || 'N/A'} sq ft ${formData.buildingType || 'commercial'} space`);
    }

    if (formData.cleaningType) {
      notes.push(`Service type: ${formData.cleaningType}`);
    }

    return notes.join(' | ');
  }

  private generateTags(formData: Record<string, any>): string[] {
    const tags = ['Website Lead'];

    if (formData.propertyType && typeof formData.propertyType === 'string') {
      tags.push(formData.propertyType.charAt(0).toUpperCase() + formData.propertyType.slice(1));
    }

    if (formData.cleaningType === 'deep') {
      tags.push('Deep Clean');
    }

    return tags;
  }

  private extractCustomFields(formData: Record<string, any>): Record<string, any> {
    const customFields: Record<string, any> = {};

    if (formData.propertyType === 'residential') {
      customFields.bedrooms = formData.bedrooms;
      customFields.bathrooms = formData.bathrooms;
    } else {
      customFields.squareFootage = formData.squareFootage;
      customFields.buildingType = formData.buildingType;
    }

    customFields.cleaningType = formData.cleaningType;
    customFields.frequency = formData.frequency;

    return customFields;
  }
}

export const crmService = new CRMService();
