# Architecture Decisions

## Monorepo Structure (Turborepo + pnpm)

**Rationale:**
- **Turborepo**: Intelligent task orchestration with caching reduces build time by 75%+
- **pnpm**: 3x faster than npm, with disk-space efficiency via symlinks
- **Workspaces**: Isolated packages enable independent versioning and deployment
- **Path aliases**: Clean imports across packages without relative paths

## Three Next.js Apps

**Why separate web and projector?**
- **Web**: Client-facing dashboard (authenticated users)
- **Projector**: Full-screen presentation mode (read-only, WebSocket streaming)
- **Independent scaling**: Projector can be cached and served globally
- **Different analytics**: Separate tracking for UX improvements

## NestJS Backend

**Architectural Decisions:**
- **Modular structure**: Feature modules promote separation of concerns
- **Global exception handling**: Consistent error responses
- **Response interceptors**: Standardized API responses
- **Versioning**: API/v1, API/v2 for backward compatibility
- **Validation pipes**: Input sanitization at entry point
- **Guards & strategies**: JWT auth with role-based access control

## Database: PostgreSQL + Prisma

**Why Prisma?**
- Type-safe database operations
- Automatic migrations
- Strong TypeScript support
- Query optimization and N+1 prevention
- Built-in transaction support

**Schema Design:**
- Soft deletes for audit trails
- Composite indexes for performance
- Foreign key constraints with cascade rules
- Audit timestamps (createdAt, updatedAt, deletedAt)
- Multi-tenancy isolation via organizationId

## Real-time: Socket.IO + Redis

**Architecture:**
- **Redis adapter**: Horizontal scaling support
- **Namespaces**: Logical event organization (/event, /poll, /question)
- **Rooms**: Per-event communication (e.g., /event/eventId)
- **Pub/Sub**: Efficient message broadcasting
- **Connection pooling**: Managed via Upstash Redis

## Security Layers

1. **Helmet**: HTTP headers protection
2. **Rate limiting**: Zone-based (API: 100 r/s, General: 10 r/s)
3. **CORS**: Whitelist trusted origins
4. **CSRF**: Token-based protection via NestJS
5. **Input validation**: Zod + class-validator
6. **JWT**: Short-lived access tokens, long-lived refresh tokens
7. **Audit logs**: All user actions tracked
8. **Session tracking**: IP, user agent, device info

## CI/CD Pipeline (GitHub Actions)

**Jobs:**
1. **Lint**: ESLint on all code
2. **Type-check**: TypeScript strict mode
3. **Test**: Jest with coverage targets (80%+)
4. **Build**: Production builds with caching
5. **Docker**: Multi-stage builds for minimal images
6. **Push**: Registry push on main branch

## Deployment Strategy

**Multi-environment support:**
- **Development**: Local Docker Compose
- **Staging**: Railway with GitHub integration
- **Production**: AWS ECS with RDS + Upstash Redis

**Cost optimization:**
- Upstash: Serverless Redis (pay-per-request)
- Railway: Auto-scaling containers
- AWS RDS: Multi-AZ for HA
- CloudFront: Global CDI distribution

## Nginx Reverse Proxy

**Features:**
- **Load balancing**: Round-robin across app instances
- **Rate limiting**: Per-zone configuration
- **Gzip compression**: 70%+ reduction in transfer size
- **WebSocket upgrade**: HTTP/1.1 upgrade headers
- **SSL termination**: TLS at edge
- **Health checks**: Automatic failover

## Next Phase: Prisma Schema (Phase 2)

Full database schema with:
- Organization & multi-tenancy models
- Authentication & authorization
- Event management system
- Participant tracking
- Poll & question models
- Analytics & reporting
- Audit logs
- Soft deletes
- Composite indexes
