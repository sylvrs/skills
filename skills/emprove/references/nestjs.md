# NestJS Technology Guide

This guide defines audit heuristics and refactoring patterns for NestJS API applications (Fastify/Express).

---

## 1. Domain Module Anatomy & Boundaries

### Module Structure
Each domain maps to a cohesive module folder (e.g. `src/modules/{domain}/` or `src/components/{domain}/` per project convention):
- `{domain}.module.ts`: Declares controllers and providers.
- `{domain}.controller.ts`: Routing adapter for HTTP requests.
- `{domain}.service.ts`: Business logic and database persistence.
- `dto/`: Input classes validated with `class-validator` and response classes annotated with `@ApiProperty`.
- `{domain}.controller.spec.ts`: Co-located integration tests.

### Audit Rule: No Cross-Domain Clumping
- Do NOT add unrelated endpoints to an existing module. Create a new module only for a genuinely distinct domain entity.
- Cross-cutting concerns (guards, interceptors, global exception filters) belong in shared modules or guards folders, never feature modules.

---

## 2. Thin Controllers as Routing Adapters

Controllers are **HTTP adapters**, not business engines.

### Anti-Pattern: Fat Controllers
- **Smell:** Controllers querying the ORM directly, executing complex conditional logic, or assembling SQL queries.
- **Fix:** Controllers must delegate directly to the service:
  1. Extract route parameters, query strings, and validated body.
  2. Verify authorization via guards (`@UseGuards`).
  3. Call the service method.
  4. Return the typed response.

```typescript
// BAD: Controller doing direct database access
@Get(":id")
async getPost(@Param("id") id: string) {
  const row = await this.db.query("SELECT * FROM posts WHERE id = $1", [id]);
  if (!row) throw new NotFoundException();
  return row;
}

// GOOD: Thin controller delegating to service
@Get(":id")
@ApiOperation({ summary: "Get post by id" })
async getPost(@Param("id") id: string): Promise<PostResponse> {
  return this.postsService.getPostById(id);
}
```

---

## 3. DTOs & Boundary Validation

### Anti-Pattern: Untyped or Loose Request Bodies
- **Smell:** Route handlers accepting `any`, `Record<string, unknown>`, or unvalidated interfaces (`@Body() body: any`).
- **Fix:** Accept concrete DTO classes decorated with `class-validator` rules and `@ApiProperty` metadata:

```typescript
export class CreatePostInput {
  @ApiProperty({ description: "Title of the post" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: "Optional tags" })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
```

---

## 4. Dependency Injection & Service Decoupling

### Clean Injection
- Always inject dependencies via constructor parameters (`private readonly service: Service`).
- Avoid manual instantiation (`new Service()`) inside service methods.
- Avoid circular dependencies (`forwardRef`). If two services need each other, extract their shared logic into a third domain service or repository.

---

## 5. Exception Boundaries & Semantic Errors

### Throw Semantic HTTP Exceptions at Boundaries
- In controllers or route adapters, translate operational failures into standard NestJS exceptions:
  - `NotFoundException` (404)
  - `BadRequestException` (400)
  - `UnauthorizedException` (401)
  - `ForbiddenException` (403)
  - `ConflictException` (409)

### Preserve Causal Chains
- Never swallow low-level database or external vendor errors:
```typescript
try {
  await this.paymentGateway.charge(amount);
} catch (cause) {
  throw new BadGatewayException("Payment gateway unreachable", { cause });
}
```

---

## 6. High-Fidelity Controller-Level Testing

### Test at the Controller / HTTP Boundary
- **Philosophy:** Hit endpoints through the test app harness (`MockApp` / `supertest`) with a seeded test database.
- **Why:** Verifies parameter extraction, pipe validation, auth guards, business service logic, and database queries in one unified pass that survives internal refactoring.
- **Anti-Pattern:** Mocking every service dependency in a 500-line unit test to assert that `service.find()` was called.
