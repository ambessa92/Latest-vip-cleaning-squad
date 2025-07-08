import React, { useState, useEffect } from 'react';
import { crmService, type Lead, type Activity, type CRMStats } from '../services/crm';

export default function CRMDashboard() {
  const [currentView, setCurrentView] = useState<'overview' | 'leads' | 'activities' | 'reports'>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    serviceType: '',
    assignedTo: ''
  });

  useEffect(() => {
    const loadData = () => {
      const leadsData = crmService.getLeads(filters);
      const statsData = crmService.getCRMStats();

      setLeads(leadsData);
      setStats(statsData);
    };
    loadData();
  }, [filters]);

  const handleStatusUpdate = async (leadId: string, status: Lead['status'], notes?: string) => {
    await crmService.updateLeadStatus(leadId, status, notes);
    // Reload data after status update
    const leadsData = crmService.getLeads(filters);
    const statsData = crmService.getCRMStats();
    setLeads(leadsData);
    setStats(statsData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">CRM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
                <p className="text-sm text-gray-600">Lead Management & Customer Relations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Data
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'leads', label: 'Leads', icon: '👥' },
              { id: 'activities', label: 'Activities', icon: '📝' },
              { id: 'reports', label: 'Reports', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as 'overview' | 'leads' | 'activities' | 'reports')}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {currentView === 'overview' && <OverviewTab stats={stats} leads={leads} />}
        {currentView === 'leads' && (
          <LeadsTab
            leads={leads}
            filters={filters}
            onFiltersChange={setFilters}
            onLeadSelect={setSelectedLead}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
        {currentView === 'activities' && <ActivitiesTab />}
        {currentView === 'reports' && <ReportsTab stats={stats} leads={leads} />}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  stats: CRMStats | null;
  leads: Lead[];
}

function OverviewTab({ stats, leads }: OverviewTabProps) {
  if (!stats) return <div>Loading...</div>;

  const recentLeads = leads.slice(0, 5);
  const highPriorityLeads = leads.filter(lead => lead.priority === 'High' || lead.priority === 'Urgent').slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">🆕</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 text-xl">📈</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pipeline Value</h3>
              <p className="text-2xl font-bold text-gray-900">${stats.pipelineValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads & High Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</h4>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                    <p className="text-sm text-gray-500">{lead.serviceType} • ${lead.estimatedValue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{lead.createdDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* High Priority Leads */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">High Priority Leads</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {highPriorityLeads.map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{lead.firstName} {lead.lastName}</h4>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                    <p className="text-sm text-gray-500">{lead.serviceType} • ${lead.estimatedValue}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Follow up: {lead.nextFollowUp || 'TBD'}</p>
                  </div>
                </div>
              ))}
              {highPriorityLeads.length === 0 && (
                <p className="text-gray-500 text-center py-4">No high priority leads</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Leads Tab Component
interface LeadFilters {
  status: string;
  priority: string;
  serviceType: string;
  assignedTo: string;
}

interface LeadsTabProps {
  leads: Lead[];
  filters: LeadFilters;
  onFiltersChange: (filters: LeadFilters) => void;
  onLeadSelect: (lead: Lead) => void;
  onStatusUpdate: (leadId: string, status: Lead['status'], notes?: string) => void;
}

function LeadsTab({ leads, filters, onFiltersChange, onLeadSelect, onStatusUpdate }: LeadsTabProps) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Leads</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => onFiltersChange({ ...filters, serviceType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Move-in/out">Move-in/out</option>
              <option value="Deep Clean">Deep Clean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => onFiltersChange({ ...filters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Team Members</option>
              <option value="Fin Clarke">Fin Clarke</option>
              <option value="Maria Santos">Maria Santos</option>
              <option value="David Thompson">David Thompson</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Leads ({leads.length})</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Lead
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {lead.firstName[0]}{lead.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.serviceType}</div>
                    <div className="text-sm text-gray-500">{lead.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${lead.estimatedValue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.createdDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onLeadSelect(lead)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    <select
                      onChange={(e) => onStatusUpdate(lead.id, e.target.value as Lead['status'])}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                      defaultValue=""
                    >
                      <option value="">Update Status</option>
                      <option value="Contacted">Mark as Contacted</option>
                      <option value="Qualified">Mark as Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Closed Won">Close Won</option>
                      <option value="Closed Lost">Close Lost</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Activities Tab Component
function ActivitiesTab() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch all activities
    // For demo, we'll show some sample activities
    setActivities([
      {
        id: 'act-001',
        leadId: 'lead-001',
        type: 'Call',
        description: 'Follow-up call with Mike Wilson about office cleaning quote',
        date: '2024-12-10',
        performedBy: 'Fin Clarke',
        outcome: 'Interested - scheduling site visit'
      },
      {
        id: 'act-002',
        leadId: 'lead-002',
        type: 'Email',
        description: 'Sent detailed proposal to Jennifer Brown',
        date: '2024-12-10',
        performedBy: 'Fin Clarke'
      },
      {
        id: 'act-003',
        leadId: 'lead-003',
        type: 'Note',
        description: 'New lead from website - Airbnb property manager',
        date: '2024-12-10',
        performedBy: 'System'
      }
    ]);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityTypeColor(activity.type)}`}>
                <span className="text-white text-sm">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{activity.type}</h4>
                  <span className="text-xs text-gray-500">{activity.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">By {activity.performedBy}</span>
                  {activity.outcome && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {activity.outcome}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
interface ReportsTabProps {
  stats: CRMStats | null;
  leads: Lead[];
}

function ReportsTab({ stats, leads }: ReportsTabProps) {
  if (!stats) return <div>Loading...</div>;

  const serviceTypeStats = leads.reduce((acc, lead) => {
    acc[lead.serviceType] = (acc[lead.serviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusStats = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Revenue:</span>
              <span className="font-semibold">${stats.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pipeline Value:</span>
              <span className="font-semibold">${stats.pipelineValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Deal Value:</span>
              <span className="font-semibold">${stats.averageDealValue}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Leads:</span>
              <span className="font-semibold">{stats.totalLeads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Qualified Leads:</span>
              <span className="font-semibold">{stats.qualifiedLeads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Conversion Rate:</span>
              <span className="font-semibold">{stats.conversionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(serviceTypeStats).map(([service, count]) => (
              <div key={service} className="flex justify-between items-center">
                <span className="text-gray-600">{service}:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{count as number}</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((count as number) / stats.totalLeads) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(statusStats).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                <span className="text-lg font-bold">{count as number}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lead Detail Modal Component
interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onStatusUpdate: (leadId: string, status: Lead['status'], notes?: string) => void;
}

function LeadDetailModal({ lead, onClose, onStatusUpdate }: LeadDetailModalProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const leadActivities = crmService.getActivities(lead.id);
    setActivities(leadActivities);
  }, [lead.id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    await crmService.addActivity(lead.id, {
      type: 'Note',
      description: newNote,
      performedBy: 'Fin Clarke'
    });

    setNewNote('');
    // Refresh activities
    const updatedActivities = crmService.getActivities(lead.id);
    setActivities(updatedActivities);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {lead.firstName} {lead.lastName}
              </h2>
              <p className="text-gray-600">{lead.email} • {lead.phone}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lead Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Priority</label>
                    <p className="font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Service Type</label>
                    <p className="font-medium">{lead.serviceType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Estimated Value</label>
                    <p className="font-medium">${lead.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Source</label>
                    <p className="font-medium">{lead.source}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Assigned To</label>
                    <p className="font-medium">{lead.assignedTo}</p>
                  </div>
                </div>

                {lead.address && (
                  <div>
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-medium">{lead.address}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Notes</label>
                  <p className="text-sm">{lead.notes}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {lead.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Update */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm text-gray-600">Update Status</label>
                  <select
                    onChange={(e) => onStatusUpdate(lead.id, e.target.value as Lead['status'])}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="">Select new status</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>

              {/* Add Note */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="text-sm text-gray-600">Add Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add a note about this lead..."
                />
                <button
                  onClick={handleAddNote}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Note
                </button>
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{activity.type}</h4>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">By {activity.performedBy}</span>
                      {activity.outcome && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                          {activity.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No activities yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-800';
    case 'Contacted': return 'bg-yellow-100 text-yellow-800';
    case 'Qualified': return 'bg-green-100 text-green-800';
    case 'Proposal Sent': return 'bg-purple-100 text-purple-800';
    case 'Closed Won': return 'bg-emerald-100 text-emerald-800';
    case 'Closed Lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'Low': return 'bg-gray-100 text-gray-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'High': return 'bg-orange-100 text-orange-800';
    case 'Urgent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getActivityTypeColor(type: string): string {
  switch (type) {
    case 'Call': return 'bg-green-500';
    case 'Email': return 'bg-blue-500';
    case 'Meeting': return 'bg-purple-500';
    case 'Quote Sent': return 'bg-yellow-500';
    case 'Note': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'Call': return '📞';
    case 'Email': return '✉️';
    case 'Meeting': return '🤝';
    case 'Quote Sent': return '📄';
    case 'Note': return '📝';
    default: return '📋';
  }
}
