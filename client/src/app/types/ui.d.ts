import { ReactNode } from "react"

/*
declare module "@/components/ui/button" {
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    children?: ReactNode
  }
  export const Button: React.FC<ButtonProps>
}
*/

// Removed Dialog* declarations to avoid redeclaration errors

declare module "@/components/ui/dropdown-menu" {
  export interface DropdownMenuProps {
    children?: ReactNode
  }
  export const DropdownMenu: React.FC<DropdownMenuProps>
  export const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children?: ReactNode }>
  export const DropdownMenuContent: React.FC<{ align?: "start" | "end" | "center"; children?: ReactNode }>
  export const DropdownMenuItem: React.FC<{ onClick?: () => void; children?: ReactNode }>
  export const DropdownMenuLabel: React.FC<{ children?: ReactNode }>
  export const DropdownMenuSeparator: React.FC
}

declare module "@/components/ui/badge" {
  export interface BadgeProps {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success"
    children?: ReactNode
  }
  export const Badge: React.FC<BadgeProps>
} 