'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Building2, Network, Settings as SettingsIcon, Loader2, AlertCircle, Plus } from 'lucide-react';

export default function OrganizationsDashboard() {
  const [activeTab, setActiveTab] = useState<'info' | 'departments'>('info');
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'info') {
        const res = await fetch('/api/organizations/current');
        if (!res.ok) throw new Error('Failed to fetch organization');
        const json = await res.json();
        setOrgInfo(json.data);
      } else {
        const res = await fetch('/api/organizations/departments');
        if (!res.ok) throw new Error('Failed to fetch departments');
        const json = await res.json();
        setDepartments(json.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveOrgInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgInfo.name, domain: orgInfo.domain })
      });
      if (!res.ok) throw new Error('Failed to save organization');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Organization Profile</h2>
        {activeTab === 'departments' && (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        )}
      </div>

      <div className="flex space-x-4 border-b border-asas-silver/10 pb-4">
        <Button 
          variant={activeTab === 'info' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('info')}
        >
          <Building2 className="mr-2 h-4 w-4" /> General Info
        </Button>
        <Button 
          variant={activeTab === 'departments' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('departments')}
        >
          <Network className="mr-2 h-4 w-4" /> Departments
        </Button>
      </div>

      {loading ? (
         <div className="flex h-[200px] items-center justify-center">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      ) : error ? (
         <div className="flex h-[200px] items-center justify-center text-red-400">
           <AlertCircle className="mr-2 h-5 w-5" /> {error}
         </div>
      ) : activeTab === 'info' && orgInfo ? (
        <div className="max-w-2xl rounded-xl border bg-card text-card-foreground shadow-sm bg-asas-charcoal/50 border-asas-silver/10 p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold leading-none tracking-tight">Organization Details</h3>
            <p className="text-sm text-muted-foreground">Manage your principal organization identity and domain.</p>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Organization Name</label>
               <Input 
                 value={orgInfo.name || ''} 
                 onChange={e => setOrgInfo({...orgInfo, name: e.target.value})}
                 className="bg-black/50 border-asas-silver/20"
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Primary Domain</label>
               <Input 
                 value={orgInfo.domain || ''} 
                 onChange={e => setOrgInfo({...orgInfo, domain: e.target.value})}
                 className="bg-black/50 border-asas-silver/20"
               />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium text-muted-foreground">Internal Slug (Read-only)</label>
               <Input 
                 value={orgInfo.slug || ''} 
                 disabled
                 className="bg-black/50 border-asas-silver/10 opacity-50"
               />
             </div>
          </div>

          <Button onClick={saveOrgInfo} disabled={saving} className="w-full sm:w-auto">
             {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      ) : activeTab === 'departments' ? (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-asas-charcoal/50 border-asas-silver/10 p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Departments Directory</h3>
            <p className="text-sm text-muted-foreground">Organizational units and hierarchy mapping.</p>
          </div>
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead className="[&_tr]:border-b border-asas-silver/10">
                <tr className="border-b border-asas-silver/10 bg-muted/50 hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Department Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Manager</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y divide-asas-silver/10">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 align-middle text-center text-muted-foreground py-8">
                      No departments configured.
                    </td>
                  </tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.id} className="border-b border-asas-silver/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{dept.name}</td>
                      <td className="p-4 align-middle">
                        {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : <span className="text-muted-foreground text-xs italic">Unassigned</span>}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
