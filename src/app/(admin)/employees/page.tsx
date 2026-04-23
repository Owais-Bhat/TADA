"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Shield } from "lucide-react"
import type { Database } from "@/lib/supabase/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    setLoading(true)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_active", true)
      .order("name")
    setEmployees(data || [])
    setLoading(false)
  }

  const roleColors: Record<string, string> = {
    Regular: "bg-muted text-muted-foreground",
    Manager: "bg-primary/20 text-primary",
    HR: "bg-warning/20 text-warning",
    Finance: "bg-success/20 text-success",
    SuperAdmin: "bg-destructive/20 text-destructive",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold">Employee Management</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <GlassCard hover={false} className="text-center py-12">
            <p className="text-muted-foreground">Loading employees...</p>
          </GlassCard>
        ) : employees.length === 0 ? (
          <GlassCard hover={false} className="text-center py-12">
            <p className="text-muted-foreground">No employees found</p>
          </GlassCard>
        ) : (
          employees.map((emp) => (
            <GlassCard key={emp.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-bold text-sm">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-muted-foreground">{emp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={roleColors[emp.role] || ""}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {emp.role}
                </Badge>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  )
}
