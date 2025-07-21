import { NextRequest, NextResponse } from 'next/server'
import { BlogAnalyticsEvent } from '@/lib/blog-analytics'

// Simple in-memory storage for demo purposes
// In production, this would connect to your analytics database
const analyticsEvents: (BlogAnalyticsEvent & { sessionId: string })[] = []

export async function POST(request: NextRequest) {
  try {
    const event = await request.json() as BlogAnalyticsEvent & { sessionId: string }
    
    // Validate event data
    if (!event.type || !event.postId || !event.postSlug || !event.timestamp) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
        { status: 400 }
      )
    }

    // Store the event
    analyticsEvents.push({
      ...event,
      timestamp: Date.now() // Use server timestamp for consistency
    })

    // In production, you would:
    // 1. Store in a proper analytics database (e.g., ClickHouse, BigQuery)
    // 2. Send to analytics services (Google Analytics, Mixpanel, etc.)
    // 3. Process for real-time dashboards
    
    console.log(`Analytics Event: ${event.type} for post ${event.postSlug}`, event.metadata)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing analytics event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')
    const type = searchParams.get('type')
    const days = parseInt(searchParams.get('days') || '30')

    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
    
    let filteredEvents = analyticsEvents.filter(event => event.timestamp > cutoffDate)
    
    if (postSlug) {
      filteredEvents = filteredEvents.filter(event => event.postSlug === postSlug)
    }
    
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type)
    }

    // Calculate basic metrics
    const metrics = {
      totalEvents: filteredEvents.length,
      eventsByType: filteredEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      eventsByPost: filteredEvents.reduce((acc, event) => {
        acc[event.postSlug] = (acc[event.postSlug] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      uniqueSessions: new Set(filteredEvents.map(event => event.sessionId)).size,
      averageTimeSpent: filteredEvents
        .filter(event => event.type === 'time_spent' && event.metadata?.timeSpent)
        .reduce((sum, event) => sum + (event.metadata?.timeSpent || 0), 0) / 
        filteredEvents.filter(event => event.type === 'time_spent').length || 0,
      averageScrollDepth: filteredEvents
        .filter(event => event.type === 'scroll_depth' && event.metadata?.scrollDepth)
        .reduce((sum, event) => sum + (event.metadata?.scrollDepth || 0), 0) / 
        filteredEvents.filter(event => event.type === 'scroll_depth').length || 0,
    }

    return NextResponse.json({
      metrics,
      events: filteredEvents.slice(0, 100) // Limit to last 100 events
    })

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
