import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDetailService } from './admin-detail.service';
import { UserModel } from './admin-detail.model';

@Component({
  selector: 'app-admin-detail',
  imports: [CommonModule],
  templateUrl: './admin-detail.component.html',
  styleUrl: './admin-detail.component.scss'
})
export class AdminDetailComponent implements OnInit, OnDestroy {
  activeTab: string = 'user-permissions';
  users: UserModel[] = [];
  isLoading: boolean = false;

  // Mock data for demonstration - replace with actual account/application IDs
  private accountId: number = 1;
  private applicationId: number = 1;

  constructor(private adminDetailService: AdminDetailService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onTabClick(tabName: string): void {
    this.activeTab = tabName;
    if (tabName === 'user-permissions') {
      this.loadUsers();
    }
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
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        // Load mock data on error for demonstration
        this.users = this.getMockUsers();
      }
    });
  }

  generateInitials(firstName: string, lastName: string): string {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  }

  onInviteUser(): void {
    console.log('Invite user clicked');
    // TODO: Implement invite user functionality
  }

  onEditUser(user: UserModel): void {
    console.log('Edit user:', user);
    // TODO: Implement edit user functionality
  }

  onRemoveUser(user: UserModel): void {
    console.log('Remove user:', user);
    // TODO: Implement remove user functionality
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
