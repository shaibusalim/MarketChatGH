"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Activity, Clock, UserPlus, ShoppingBag, CheckCircle2 } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "new_seller",
    user: "Kofi Mensah",
    action: "registered as a new partner",
    time: "2 mins ago",
    icon: <UserPlus className="h-3 w-3 text-blue-600" />,
    color: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    id: 2,
    type: "new_product",
    user: "Organic Farms",
    action: "added 'Fresh Tomatoes' to catalog",
    time: "15 mins ago",
    icon: <ShoppingBag className="h-3 w-3 text-emerald-600" />,
    color: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    id: 3,
    type: "approval",
    user: "Admin",
    action: "verified 'Sunshine Bakery'",
    time: "1 hour ago",
    icon: <CheckCircle2 className="h-3 w-3 text-purple-600" />,
    color: "bg-purple-50 dark:bg-purple-900/30",
  },
  {
    id: 4,
    type: "new_seller",
    user: "Ama Serwaa",
    action: "updated shop location",
    time: "3 hours ago",
    icon: <Activity className="h-3 w-3 text-orange-600" />,
    color: "bg-orange-50 dark:bg-orange-900/30",
  },
]

export function AdminActivityLog() {
  return (
    <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
      <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
           <Activity className="h-5 w-5 text-blue-600" /> Live Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="p-6 space-y-6">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 relative"
              >
                {index !== activities.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-gray-100 dark:bg-gray-800" />
                )}
                <div className={`h-8 w-8 rounded-xl ${activity.color} flex items-center justify-center shrink-0 z-10`}>
                  {activity.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-900 dark:text-white">
                    <span className="font-black">{activity.user}</span>{" "}
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{activity.action}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                    <Clock className="h-2.5 w-2.5" /> {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 text-center">
           <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline">
             View Full Audit Log
           </button>
        </div>
      </CardContent>
    </Card>
  )
}
