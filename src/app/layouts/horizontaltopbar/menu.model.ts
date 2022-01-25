export interface MenuItem {
    id?: number;
    label?: any;
    icon?: string;
    link?: string;
    subItems?: any;
    parentId?: number;
    isUiElement?: boolean;
}
