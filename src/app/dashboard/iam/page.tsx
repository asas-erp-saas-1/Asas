'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Users, Shield, Loader2, AlertCircle } from 'lucide-react';

export default function IAMDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = activeTab === 'users' ? '/api/iam/users' : '/api/iam/roles';
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const json = await res.json();
      if (activeTab === 'users') {
        setUsers(json.data || []);
      } else {
        setRoles(json.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Identity & Access</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> 
            {activeTab === 'users' ? 'Add User' : 'Add Role'}
          </Button>
        </div>
      </div>

      <div className="flex space-x-4 border-b pb-4">
        <Button 
          variant={activeTab === 'users' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('users')}
        >
          <Users className="mr-2 h-4 w-4" /> Users
        </Button>
        <Button 
          variant={activeTab === 'roles' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('roles')}
        >
          <Shield className="mr-2 h-4 w-4" /> Roles
        </Button>
      </div>

      {loading ? (
        <div className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex h-[200px] items-center justify-center text-destructive">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      ) : activeTab === 'users' ? (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-asas-charcoal/50 border-asas-silver/10 p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Users</h3>
            <p className="text-sm text-muted-foreground">Manage user accounts and their access across the organization.</p>
          </div>
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead className="[&_tr]:border-b border-asas-silver/10">
                <tr className="border-b border-asas-silver/10 bg-muted/50 hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">System Provider</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y divide-asas-silver/10">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 align-middle text-center text-muted-foreground py-8">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-asas-silver/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="p-4 align-middle">{user.email}</td>
                      <td className="p-4 align-middle">
                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                         }`}>
                           {user.status}
                         </span>
                      </td>
                      <td className="p-4 align-middle">{user.roleName || 'Standard'}</td>
                      <td className="p-4 align-middle capitalize">{user.provider}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-asas-charcoal/50 border-asas-silver/10 p-6">
          <div className="flex flex-col space-y-1.5 pb-4">
            <h3 className="font-semibold leading-none tracking-tight">Roles & Permissions</h3>
            <p className="text-sm text-muted-foreground">Define system roles and assign specific context permissions.</p>
          </div>
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm border-collapse">
              <thead className="[&_tr]:border-b border-asas-silver/10">
                <tr className="border-b border-asas-silver/10 bg-muted/50 hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Description</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Permissions</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y divide-asas-silver/10">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 align-middle text-center text-muted-foreground py-8">
                      No roles defined.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="border-b border-asas-silver/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{role.name}</td>
                      <td className="p-4 align-middle">{role.description}</td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.map((p: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-white/10 text-asas-sand rounded-full text-xs">
                              {p.permissionContext}:{p.action}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-middle">{role.isSystem ? 'System' : 'Custom'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
