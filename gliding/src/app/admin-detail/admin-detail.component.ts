import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDetailService } from './admin-detail.service';
import { UserModel, IntegrationConnectionRequest } from './admin-detail.model';

@Component({
  selector: 'app-admin-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-detail.component.html',
  styleUrl: './admin-detail.component.scss'
})
export class AdminDetailComponent implements OnInit, OnDestroy {
  activeTab: string = 'integrations';
  users: UserModel[] = [];
  isLoading: boolean = false;
  integrations: IntegrationConnectionRequest[] = [];

  // Stats
  activeUsersCount: number = 0;
  adminUsersCount: number = 0;
  totalIntegrationsCount: number = 0;

  // Connect dialog state
  showConnectDialog: boolean = false;
  selectedIntegration: string = '';
  connectForm: { clientId: string; clientSecret: string; url: string } = {
    clientId: '',
    clientSecret: '',
    url: ''
  };


  // Mock data for demonstration - replace with actual account/application IDs
  private accountId: number = 1;
  private applicationId: number = 1;

  constructor(private adminDetailService: AdminDetailService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadIntegrations();
  }

  // ================= User management modals/state =================
  showInviteModal: boolean = false;
  submittingInvite: boolean = false;
  inviteForm: { email: string; firstName: string; lastName: string; fullName: string; type: string; status: string } = {
    email: '', firstName: '', lastName: '', fullName: '', type: 'USER', status: 'active'
  };

  showEditModal: boolean = false;
  submittingEdit: boolean = false;
  editForm: { id: number; type: string; status: string } = { id: 0, type: 'USER', status: 'active' };

  closeInvite(): void { this.showInviteModal = false; }
  closeEdit(): void { this.showEditModal = false; }

  submitInvite(): void {
    const f = this.inviteForm;
    if (!f.email?.trim()) { alert('Email is required'); return; }
    const payload = {
      accountId: this.accountId,
      applicationId: this.applicationId,
      email: f.email.trim(),
      firstName: f.firstName?.trim() || '',
      lastName: f.lastName?.trim() || '',
      fullName: f.fullName?.trim() || `${f.firstName || ''} ${f.lastName || ''}`.trim(),
      type: f.type,
      status: f.status
    };
    this.submittingInvite = true;
    this.adminDetailService.inviteUser(payload).subscribe({
      next: (user) => {
        this.submittingInvite = false;
        this.showInviteModal = false;
        if (user) {
          this.users = [
            ...this.users,
            { ...user, fullName: user.fullName || `${user.firstName} ${user.lastName}` }
          ];
        } else {
          alert('Invite request sent');
        }
      },
      error: (err) => {
        console.error('Invite failed', err);
        this.submittingInvite = false;
        alert('Failed to invite user');
      }
    });
  }

  submitEdit(): void {
    const e = this.editForm;
    if (!e?.id) { this.showEditModal = false; return; }
    this.submittingEdit = true;
    const existing = this.users.find(u => (u as any).id === e.id) as any;
    const fullUser = {
      ...(existing || {}),
      id: e.id,
      type: e.type,
      status: e.status,
      // Ensure required fields exist in payload
      email: existing?.email || '',
      firstName: existing?.firstName || '',
      lastName: existing?.lastName || '',
      fullName: existing?.fullName || `${existing?.firstName || ''} ${existing?.lastName || ''}`.trim()
    } as any;
    this.adminDetailService.updateUser(fullUser).subscribe({
      next: (updated) => {
        this.submittingEdit = false;
        this.showEditModal = false;
        if (updated) {
          this.users = this.users.map(u => (u as any).id === e.id ? { ...u, ...updated } as any : u);
        } else {
          // optimistic update
          this.users = this.users.map(u => (u as any).id === e.id ? { ...u, type: e.type, status: e.status } as any : u);
        }
      },
      error: (err) => {
        console.error('Update failed', err);
        this.submittingEdit = false;
        alert('Failed to update user');
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onTabClick(tabName: string): void {
    this.activeTab = tabName;
    if (tabName === 'user-permissions') {
      this.loadUsers();
    } else if (tabName === 'integrations') {
      this.loadIntegrations();
    }
  }

  openConnectDialog(integrationName: string): void {
    this.selectedIntegration = integrationName;
    this.connectForm = { clientId: '', clientSecret: '', url: '' };
    this.showConnectDialog = true;
  }

  closeConnectDialog(): void {
    this.showConnectDialog = false;
  }

  submitConnect(): void {
    const payload: IntegrationConnectionRequest = {
      clientId: this.connectForm.clientId,
      clientSecret: this.connectForm.clientSecret,
      integrationType: this.selectedIntegration,
      oauthUri: this.connectForm.url,
      isAuthorized: false,
      id: 0
    };

    this.adminDetailService.saveConnection(payload).subscribe({
      next: (res) => {
        console.log('Connection saved:', res);
        if (res) {
          const authorized = (res as any).isAuthorized ?? true;
          // Mark selected integration as connected in local list
          const idx = this.integrations.findIndex(
            i => i.integrationType === this.selectedIntegration
          );
          if (idx > -1) {
            this.integrations[idx] = {
              ...this.integrations[idx],
              isAuthorized: authorized
            };
          } else {
            this.integrations.push({ ...payload, isAuthorized: authorized });
          }
        }
        this.closeConnectDialog();
      },
      error: (err) => {
        console.error('Failed to save connection', err);
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminDetailService.getUsers(this.accountId, this.applicationId).subscribe({
      next: (users: UserModel[]) => {
        this.users = users.map(user => ({
          ...user,
          fullName: user.fullName || `${user.firstName} ${user.lastName}`
        }));
        this.isLoading = false;
        console.log('Users loaded:', this.users);
        // Update stats
        this.activeUsersCount = this.users.filter(u => (u as any).status?.toLowerCase?.() === 'active').length;
        this.adminUsersCount = this.users.filter(u => (u as any).type?.toUpperCase?.() === 'ADMIN').length;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        // Load mock data on error for demonstration
        this.users = this.getMockUsers();
        this.activeUsersCount = this.users.filter(u => (u as any).status?.toLowerCase?.() === 'active').length;
        this.adminUsersCount = this.users.filter(u => (u as any).type?.toUpperCase?.() === 'ADMIN').length;
      }
    });
  }

  loadIntegrations(): void {
    this.adminDetailService.getConnection().subscribe({
      next: (items) => {
        const fetched = items || [];
        // Ensure Freshdesk appears even if not yet connected
        const hasFreshdesk = fetched.some(i => (i.integrationType || '').toLowerCase() === 'freshdesk');
        this.integrations = hasFreshdesk
          ? fetched
          : [...fetched, {
              clientId: '',
              clientSecret: '',
              integrationType: 'Freshdesk',
              oauthUri: '',
              isAuthorized: false,
              id: 0
            } as IntegrationConnectionRequest];
        this.totalIntegrationsCount = this.integrations.length;
      },
      error: (err) => {
        console.error('Error loading integrations', err);
        // On error, still show placeholder Freshdesk card
        this.integrations = this.integrations && this.integrations.length > 0 ? this.integrations : [{
          clientId: '',
          clientSecret: '',
          integrationType: 'Freshdesk',
          oauthUri: '',
          isAuthorized: false,
          id: 0
        } as IntegrationConnectionRequest];
        this.totalIntegrationsCount = this.integrations.length;
      }
    });
  }

  generateInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  onInviteUser(): void {
    this.inviteForm = {
      email: '',
      firstName: '',
      lastName: '',
      fullName: '',
      type: 'USER',
      status: 'active'
    };
    this.showInviteModal = true;
  }

  onEditUser(user: UserModel): void {
    this.editForm = {
      id: (user as any).id,
      type: user.type || 'USER',
      status: (user as any).status || 'active'
    } as any;
    this.showEditModal = true;
  }

  onRemoveUser(user: UserModel): void {
    if (!user || !(user as any).id) return;
    const ok = confirm(`Remove user ${user.fullName || user.email}?`);
    if (!ok) return;
    this.adminDetailService.removeUser((user as any).id).subscribe({
      next: () => {
        // Treat any successful HTTP response as success and update UI
        this.users = this.users.filter(u => (u as any).id !== (user as any).id);
      },
      error: (err) => {
        console.error('Failed to remove user', err);
        alert('Failed to remove user');
      }
    });
  }

  onRoleChange(user: UserModel, newRole: string): void {
    console.log('Role change for user:', user, 'New role:', newRole);
    // TODO: Implement role change functionality
  }

  getAvatarColor(initials: string): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
      '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  }

  private getMockUsers(): any[] {
    return [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        type: 'ADMIN', // Role is stored in type field (uppercase to match API)
        lastActive: '5 min ago'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        status: 'active',
        type: 'USER', // Role is stored in type field (uppercase to match API)
        lastActive: '1 hour ago'
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        fullName: 'Mike Johnson',
        email: 'mike@example.com',
        status: 'active',
        type: 'USER', // Role is stored in type field (uppercase to match API)
        lastActive: '2 days ago'
      },
      {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Wilson',
        fullName: 'Sarah Wilson',
        email: 'sarah@example.com',
        status: 'inactive',
        type: 'USER' // Role is stored in type field (uppercase to match API)
      }
    ];
  }
}
