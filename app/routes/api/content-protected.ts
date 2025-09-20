/**
 * Enhanced Content API with Authentication
 * Demonstrates how to integrate the new authentication system with existing APIs
 */

import { createAPIFileRoute } from '@tanstack/start/api'
import { withAuth, withRole, createAuthenticatedResponse } from '~/server/auth-helpers'
import { ContentAPI } from './content-api'
import { ApiResponseBuilder } from '~/lib/api-response'
import { applySecurityHeaders } from '~/server/security-headers'

export const Route = createAPIFileRoute('/api/content/$contentType')({
  // Public endpoint - anyone can read content
  GET: async ({ params, request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || undefined

    const result = await ContentAPI.listEntries(params.contentType, {
      page,
      limit,
      search,
    })

    const response = ApiResponseBuilder.createHttpResponse(result)
    return applySecurityHeaders(response)
  },

  // Protected endpoint - only authenticated users can create content
  POST: withAuth(async ({ params, request, user }) => {
    try {
      const data = await request.json()
      const result = await ContentAPI.createEntry(params.contentType, data)

      // Add audit trail information
      const auditData = {
        ...result.data,
        createdBy: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        timestamp: new Date().toISOString(),
      }

      const response = createAuthenticatedResponse(
        { ...result, data: auditData },
        user,
        201
      )

      return applySecurityHeaders(response)
    } catch (error) {
      const errorResponse = ApiResponseBuilder.createHttpResponse(
        ApiResponseBuilder.error({
          code: 'BAD_REQUEST',
          message: 'Invalid JSON in request body',
          details: ['Request body must contain valid JSON'],
        })
      )
      return applySecurityHeaders(errorResponse)
    }
  }),

  // Role-protected endpoint - only EDITORs and above can update content
  PUT: withRole('EDITOR', async ({ params, request, user }) => {
    const url = new URL(request.url)
    const entryId = url.searchParams.get('id')

    if (!entryId) {
      const errorResponse = ApiResponseBuilder.createHttpResponse(
        ApiResponseBuilder.error({
          code: 'BAD_REQUEST',
          message: 'Entry ID is required',
          details: ['Provide entry ID as query parameter: ?id=entry-id'],
        })
      )
      return applySecurityHeaders(errorResponse)
    }

    try {
      const data = await request.json()
      const result = await ContentAPI.updateEntry(params.contentType, entryId, data)

      // Add audit trail information
      const auditData = {
        ...result.data,
        updatedBy: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        updatedAt: new Date().toISOString(),
      }

      const response = createAuthenticatedResponse(
        { ...result, data: auditData },
        user
      )

      return applySecurityHeaders(response)
    } catch (error) {
      const errorResponse = ApiResponseBuilder.createHttpResponse(
        ApiResponseBuilder.error({
          code: 'BAD_REQUEST',
          message: 'Invalid JSON in request body',
          details: ['Request body must contain valid JSON'],
        })
      )
      return applySecurityHeaders(errorResponse)
    }
  }),

  // Admin-only endpoint - only ADMINs can delete content
  DELETE: withRole('ADMIN', async ({ params, request, user }) => {
    const url = new URL(request.url)
    const entryId = url.searchParams.get('id')

    if (!entryId) {
      const errorResponse = ApiResponseBuilder.createHttpResponse(
        ApiResponseBuilder.error({
          code: 'BAD_REQUEST',
          message: 'Entry ID is required',
          details: ['Provide entry ID as query parameter: ?id=entry-id'],
        })
      )
      return applySecurityHeaders(errorResponse)
    }

    const result = await ContentAPI.deleteEntry(params.contentType, entryId)

    // Add audit trail information
    const auditData = {
      ...result.data,
      deletedBy: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      deletedAt: new Date().toISOString(),
    }

    const response = createAuthenticatedResponse(
      { ...result, data: auditData },
      user
    )

    return applySecurityHeaders(response)
  }),
})