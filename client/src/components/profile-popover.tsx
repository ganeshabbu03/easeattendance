import { Link } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { User, Building2, BadgeCheck, Mail } from "lucide-react";

export function ProfilePopover() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-profile-popover" className="h-9 w-9">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{user.name}</h3>
              <Badge 
                variant="outline"
                className={`
                  text-xs capitalize mt-1
                  ${user.role === "manager" 
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" 
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  }
                `}
              >
                {user.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{user.email}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.department}</span>
            </div>

            <div className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
              <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-muted-foreground">{user.employeeId}</span>
            </div>
          </div>

          <Link href="/profile">
            <Button variant="default" className="w-full" size="sm" data-testid="button-view-full-profile">
              <User className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
