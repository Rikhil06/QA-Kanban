export interface QAReport {
    id: string;
    url: string;
    comment: string;
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
};

export type Comment = {
    id: string;
    content: string;
    parentId?: string | null;
    reportId?:  string | null;
    attachments?: Attachment[];
    replies?: Comment[];
    user: {
        id?: string,
        email?: string, 
        name: string,
    };
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
    email: string,
    site: string;
    siteName: string;
    count: number;
    lastUpdated: string | Date;
};

export type Task = {
    id: string,
    title: string,
    status: string,
    priority: 'not assigned' | 'low' | 'medium' | 'high' | 'urgent',
    dueDate: string | Date,
    project: string,
    statusColor: string;
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


export type ColumnId = 'new' | 'inProgress' | 'done';

export type Priority = 'not assigned' | 'low' | 'medium' | 'high' | 'urgent';

export type SidebarId = 'dashboard' | 'reports' | 'archived' | 'settings';

export interface KanbanProps {
    reports: QAReport[];
}
  
  
  