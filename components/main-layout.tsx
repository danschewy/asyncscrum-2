"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Calendar, Clock, LayoutDashboard, LogOut, Menu, Settings, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, current: pathname === "/dashboard" },
    { name: "Projects", href: "/projects", icon: BarChart3, current: pathname === "/projects" },
    { name: "Teams", href: "/teams", icon: Users, current: pathname === "/teams" },
    { name: "Ceremonies", href: "/ceremonies", icon: Calendar, current: pathname === "/ceremonies" },
    { name: "Prompts", href: "/prompts", icon: Clock, current: pathname === "/prompts" },
    { name: "Settings", href: "/settings", icon: Settings, current: pathname === "/settings" },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#1E90FF] text-white">AS</div>
              <span>AsyncScrum</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={item.current}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Sarah Miller</span>
                <span className="text-xs text-gray-500">Scrum Master</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Header */}
        <div className="flex w-full flex-col md:pl-0">
          <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
            <div className="flex items-center gap-2">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex h-16 items-center border-b px-6">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 font-semibold"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-[#1E90FF] text-white">AS</div>
                      <span>AsyncScrum</span>
                    </Link>
                  </div>
                  <div className="py-4">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                            item.current ? "bg-blue-50 text-[#1E90FF]" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Sarah Miller</span>
                        <span className="text-xs text-gray-500">Scrum Master</span>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#1E90FF] text-white">AS</div>
                <span>AsyncScrum</span>
              </Link>
            </div>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
