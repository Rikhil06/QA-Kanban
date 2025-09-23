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
    comment: string;
    url: string;
    x: number;
    y: number;
    timestamp: string;
    status: 'new' | 'inProgress' | 'done';
    imagePath: string;
    userName: string;
};

export type Comment = {
    id: string;
    content: string;
    parentId: string | null;
    reportId:  string | null;
    attachments: string[];
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
};

export type ColumnId = 'new' | 'inProgress' | 'done';

export type SidebarId = 'dashboard' | 'reports' | 'archived' | 'settings';

export interface KanbanProps {
    reports: QAReport[];
}
  
  
  