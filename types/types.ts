export interface QAReport {
    id: string;
    url: string;
    comment: string;
    pagePath: string;
    x: number;
    y: number;
    status: string;
    imagePath: string;
    formattedDate: string; // added field
    timestamp: string;
}



export type Report = {
    id: string;
    image: string;
    title: string;
    comment: string;
    pagePath: string;
    url: string;
    x: number;
    y: number;
    timestamp: string;
    status: ColumnId;
    priority: Priority;
    type: string;
    imagePath: string;
    userId: string;
    userName: string;
    dueDate?: string;
};

export type Comment = {
    id: string;
    content: string;
    parentId?: string | null;
    reportId?:  string | null;
    attachments?: Attachment[];
    replies?: Comment[];
    user: User;
    createdAt: string;
};

export interface ReportModalProps {
    id: string;
    onClose: () => void;
    onDeleteSuccess?: (deletedId: string) => void;
    onMoveSuccess?: (reportId: string, newStatus: ColumnId) => void;
}

export type Site = {
    id: string,
    name: string,
    slug: string,
    email: string,
    site: string;
    siteName: string;
    count: number;
    isPinned: boolean;
    counts: {
      new: number,
      inProgress: number,
      done: number,
    }
    priorities: {
      low: number,
      medium: number,
      high: number,
      urgent: number,
    }
    members: [{
      id: string,
      name: string,
      email: string,
    }]
    lastUpdated: string;
    length: number;
    siteStatus: string;
    total: number;
};

export type Task = {
    id: string,
    slug: string,
    title: string,
    site: string,
    status: string,
    priority: 'not assigned' | 'low' | 'medium' | 'high' | 'urgent',
    dueDate: string,
    project: string,
    statusColor: string;
    createdAt: Date;
    createdBy: {
      name: string,
    }
}

export type StatusData = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

export type Activity = {
  id: number;
  iconColor: string;
  action: string;
  target: string;
  status: string;
  priority: string;
  time: string;
  type: string;
  link: string;
  dueDate: string,
  user: {
    name: string;
    color: string;
    avatar: string;
  }
};

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
}

export type Filters = {
  status: string[];
  priority: string[];
  assignee: string[];
  pages: string[];
  dateRange?: { from: string; to: string };
}

export type User = {
  id: string,
  email: string, 
  name: string,
}

export type ColumnId = 'new' | 'inProgress' | 'done';

export type Priority = 'not assigned' | 'low' | 'medium' | 'high' | 'urgent';

export type SidebarId = 'dashboard' | 'reports' | 'archived' | 'settings';

export interface KanbanProps {
    reports: QAReport[];
}
  
  
  