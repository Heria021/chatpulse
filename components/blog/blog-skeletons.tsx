"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Skeleton loader for blog posts
export function BlogPostSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted rounded-full"></div>
          <div className="space-y-1">
            <div className="h-3 bg-muted rounded w-20"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
        
        {/* Cover image skeleton */}
        <div className="aspect-video bg-muted rounded-lg"></div>
        
        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
        
        {/* Code block skeleton */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
        
        {/* More content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-4/5"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for blog listing
export function BlogListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="aspect-video bg-muted rounded-lg mb-4"></div>
            <div className="h-4 bg-muted rounded w-16 mb-2"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 bg-muted rounded w-12"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="h-3 bg-muted rounded w-8"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
