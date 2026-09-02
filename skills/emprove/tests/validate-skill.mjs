import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const defaultSkillDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const skillDir = process.env.SKILL_DIR || (fs.existsSync(path.join(os.homedir(), ".cursor", "skills", "emprove")) ? path.join(os.homedir(), ".cursor", "skills", "emprove") : defaultSkillDir);
const skillFile = path.join(skillDir, "SKILL.md");

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

console.log("Checking SKILL.md invariants...");
assert(fs.existsSync(skillFile), `SKILL.md does not exist at ${skillFile}`);

const content = fs.readFileSync(skillFile, "utf-8");
assert(content.startsWith("---"), "SKILL.md missing frontmatter start");

const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
assert(frontmatterMatch, "SKILL.md missing valid YAML frontmatter block");
const frontmatter = frontmatterMatch[1];

// Frontmatter spec checks
assert(/name:\s*emprove/.test(frontmatter), "Frontmatter missing name: emprove");
assert(/description:/.test(frontmatter), "Frontmatter missing description");
assert(!/argument-hint:/.test(frontmatter), "Frontmatter should not use non-spec argument-hint; place hints in description or text");

const lines = content.split("\n");
assert(lines.length < 500, `SKILL.md body must stay under 500 lines for prompt budget; currently ${lines.length}`);

// No unexpanded placeholders
assert(!/TODO|TBD|FIXME|implement later/i.test(content), "SKILL.md contains unfinished placeholders");

// Verify required architectural sections exist
assert(content.includes("<INVOCATION-GATE>"), "Missing INVOCATION-GATE in SKILL.md");
assert(content.includes("## Non-Negotiable Core Invariants (Primacy)"), "Missing Primacy Core Invariants in SKILL.md");
assert(content.includes("## Precedence Ladder"), "Missing Precedence Ladder in SKILL.md");
assert(content.includes("## Invocation Modes"), "Missing Invocation Modes in SKILL.md");
assert(content.includes("## Scope Resolution"), "Missing Scope Resolution in SKILL.md");
assert(content.includes("## Progressive Disclosure & Technology Routing"), "Missing Progressive Disclosure routing table in SKILL.md");
assert(content.includes("Phase Exit Gate 3"), "Missing Phase Exit Gate 3 in SKILL.md");
assert(content.includes("Phase Exit Gate 4"), "Missing Phase Exit Gate 4 in SKILL.md");
assert(content.includes("Never Ask in a Vacuum"), "Missing Context & Concrete Examples requirement for Strategic Checkpoint questions in SKILL.md");
assert(content.includes("Pre-Flight Invariant Verification"), "Missing Pre-Flight Invariant Verification in SKILL.md");
assert(content.includes("## Anti-Rationalization Table (Preempting Agent Excuses)"), "Missing Anti-Rationalization Table in SKILL.md");
assert(content.includes("## Final Exit Checklist (Verify Before Responding) (Recency)"), "Missing Recency Exit Checklist in SKILL.md");

console.log("Task 1 validation passed.");

const referenceFile = path.join(skillDir, "reference.md");
console.log("Checking reference.md invariants...");
assert(fs.existsSync(referenceFile), `reference.md does not exist at ${referenceFile}`);

const refContent = fs.readFileSync(referenceFile, "utf-8");
assert(!/TODO|TBD|FIXME|implement later/i.test(refContent), "reference.md contains unfinished placeholders");

// Check fence balance
const backtickBlocks = (refContent.match(/```/g) || []).length;
assert(backtickBlocks % 2 === 0, `Unbalanced code fences in reference.md (${backtickBlocks} count)`);

// Check required core sections
assert(refContent.includes("# Emprove Quality Reference"), "Missing title in reference.md");
assert(refContent.includes("## 1. The Emprove Pentagon"), "Missing Pentagon section");
assert(refContent.includes("## 2. Pillar-to-Heuristic Index"), "Missing Pillar Index section");
assert(refContent.includes("## 3. Concrete Domain Types vs. Anonymous Shapes"), "Missing Concrete Types section");
assert(refContent.includes("## 4. Anti-Slop Heuristics"), "Missing Anti-Slop section");
assert(refContent.includes("## 5. Control Flow & Complexity Reduction"), "Missing Complexity section");
assert(refContent.includes("## 6. Test Fidelity & Strengthening-Only Taxonomy"), "Missing Test Taxonomy section");
assert(refContent.includes("## 7. Async & Concurrency Correctness"), "Missing Async section");
assert(refContent.includes("## 8. Dead Code & Comment Slop"), "Missing Dead Code section");
assert(refContent.includes("## 9. Non-Goals & Scope Boundaries"), "Missing Non-Goals section");

console.log("Task 2 validation passed.");

const tsGuideFile = path.join(skillDir, "references", "typescript.md");
console.log("Checking references/typescript.md invariants...");
assert(fs.existsSync(tsGuideFile), `references/typescript.md does not exist at ${tsGuideFile}`);

const tsContent = fs.readFileSync(tsGuideFile, "utf-8");
assert(!/TODO|TBD|FIXME|implement later/i.test(tsContent), "typescript.md contains unfinished placeholders");
const tsBackticks = (tsContent.match(/```/g) || []).length;
assert(tsBackticks % 2 === 0, `Unbalanced code fences in typescript.md (${tsBackticks} count)`);

assert(tsContent.includes("# TypeScript Dialect Guide"), "Missing title in typescript.md");
assert(tsContent.includes("## 1. Strict Typing & Anti-Slop Discipline"), "Missing Strict Typing section");
assert(tsContent.includes("## 2. Concrete Domain Types vs. Anonymous Shapes"), "Missing Concrete Domain Types section");
assert(tsContent.includes("## 3. State & Modeling: Discriminated Unions"), "Missing Discriminated Unions section");
assert(tsContent.includes("## 4. Enums vs. Const Maps"), "Missing Enums section");
assert(tsContent.includes("## 5. Error Handling & Result Types"), "Missing Error Handling section");
assert(tsContent.includes("## 6. High-Fidelity TypeScript Testing"), "Missing Testing section");
assert(tsContent.includes("## 7. Relative Imports & Boundary Locality"), "Missing Relative Imports section");

console.log("Task 3 validation passed.");

const reactGuideFile = path.join(skillDir, "references", "react.md");
console.log("Checking references/react.md invariants...");
assert(fs.existsSync(reactGuideFile), `references/react.md does not exist at ${reactGuideFile}`);

const reactContent = fs.readFileSync(reactGuideFile, "utf-8");
assert(!/TODO|TBD|FIXME|implement later/i.test(reactContent), "react.md contains unfinished placeholders");
const reactBackticks = (reactContent.match(/```/g) || []).length;
assert(reactBackticks % 2 === 0, `Unbalanced code fences in react.md (${reactBackticks} count)`);

assert(reactContent.includes("# React Technology Guide"), "Missing title in react.md");
assert(reactContent.includes("## 1. Component Architecture & Hierarchy"), "Missing Component Architecture section");
assert(reactContent.includes("## 2. State Management: Never Store What You Compute"), "Missing State Management section");
assert(reactContent.includes("## 3. useEffect Discipline: The Escape Hatch"), "Missing useEffect Discipline section");
assert(reactContent.includes("## 4. Server State & Data Fetching"), "Missing Server State section");
assert(reactContent.includes("## 5. React Testing Library Fidelity"), "Missing RTL section");

console.log("Task 4 validation passed.");

const nestGuideFile = path.join(skillDir, "references", "nestjs.md");
console.log("Checking references/nestjs.md invariants...");
assert(fs.existsSync(nestGuideFile), `references/nestjs.md does not exist at ${nestGuideFile}`);

const nestContent = fs.readFileSync(nestGuideFile, "utf-8");
assert(!/TODO|TBD|FIXME|implement later/i.test(nestContent), "nestjs.md contains unfinished placeholders");
const nestBackticks = (nestContent.match(/```/g) || []).length;
assert(nestBackticks % 2 === 0, `Unbalanced code fences in nestjs.md (${nestBackticks} count)`);

assert(nestContent.includes("# NestJS Technology Guide"), "Missing title in nestjs.md");
assert(nestContent.includes("## 1. Domain Module Anatomy & Boundaries"), "Missing Module Anatomy section");
assert(nestContent.includes("## 2. Thin Controllers as Routing Adapters"), "Missing Thin Controllers section");
assert(nestContent.includes("## 3. DTOs & Boundary Validation"), "Missing DTO Validation section");
assert(nestContent.includes("## 4. Dependency Injection & Service Decoupling"), "Missing DI Cleanliness section");
assert(nestContent.includes("## 5. Exception Boundaries & Semantic Errors"), "Missing Exception Boundaries section");
assert(nestContent.includes("## 6. High-Fidelity Controller-Level Testing"), "Missing Controller Testing section");

console.log("Task 5 validation passed.");

const tailwindGuideFile = path.join(skillDir, "references", "tailwind.md");
console.log("Checking references/tailwind.md invariants...");
assert(fs.existsSync(tailwindGuideFile), `references/tailwind.md does not exist at ${tailwindGuideFile}`);

const twContent = fs.readFileSync(tailwindGuideFile, "utf-8");
assert(!/TODO|TBD|FIXME|implement later/i.test(twContent), "tailwind.md contains unfinished placeholders");
const twBackticks = (twContent.match(/```/g) || []).length;
assert(twBackticks % 2 === 0, `Unbalanced code fences in tailwind.md (${twBackticks} count)`);

assert(twContent.includes("# Tailwind CSS Technology Guide"), "Missing title in tailwind.md");
assert(twContent.includes("## 1. The Style vs. ClassName Schism (Mixing Inline Styles & Tailwind)"), "Missing Style vs ClassName section");
assert(twContent.includes("## 2. Dynamic Class Construction & JIT Static Analysis"), "Missing Dynamic Class Construction section");
assert(twContent.includes("## 3. Design Tokens vs. Arbitrary Value Sprawl"), "Missing Design Tokens section");
assert(twContent.includes("## 4. Class Composition & Conflict Resolution (cn / twMerge)"), "Missing Class Composition section");
assert(twContent.includes("## 5. @apply Abuse & Zombie CSS Classes"), "Missing @apply section");
assert(twContent.includes("## 6. Accessibility & State Invariants"), "Missing Accessibility section");
assert(twContent.includes("## 7. Specificity Battles & The !important Anti-Pattern"), "Missing Specificity Battles section");

console.log("Tailwind guide validation passed.");

const examplesFile = path.join(skillDir, "examples.md");
console.log("Checking examples.md invariants...");
assert(fs.existsSync(examplesFile), `examples.md does not exist at ${examplesFile}`);

const exContent = fs.readFileSync(examplesFile, "utf-8");
assert(!/TODO|TBD|FIXME|implement later/i.test(exContent), "examples.md contains unfinished placeholders");
const exBackticks = (exContent.match(/```/g) || []).length;
assert(exBackticks % 2 === 0, `Unbalanced code fences in examples.md (${exBackticks} count)`);

assert(exContent.includes("# Emprove Examples"), "Missing title in examples.md");
assert(exContent.includes("## Example 1: Full Strategic Audit with Human Checkpoint"), "Missing Example 1");
assert(exContent.includes("## Example 2: Lite Inter-Task Scorecard"), "Missing Example 2");
assert(exContent.includes("## Example 3: Tautological Test Remediation"), "Missing Example 3");
assert(exContent.includes("## Example 4: React Derived State Cleanup"), "Missing Example 4");
assert(exContent.includes("## Example 5: NestJS Fat Controller Refactoring"), "Missing Example 5");
assert(exContent.includes("## Example 6: Anti-Slop & Concrete Type Remediation"), "Missing Example 6");
assert(exContent.includes("## Example 7: Tailwind CSS & Inline Style Remediation"), "Missing Example 7");

// Link resolution check across all markdown files in skillDir
console.log("Checking markdown relative link resolution across all files...");
const allMdFiles = [skillFile, referenceFile, tsGuideFile, reactGuideFile, nestGuideFile, tailwindGuideFile, examplesFile];
for (const file of allMdFiles) {
  const fileDir = path.dirname(file);
  const text = fs.readFileSync(file, "utf-8");
  const linkRegex = /\[.*?\]\((?!https?:\/\/)(.*?)\)/g;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const targetRel = match[1].split("#")[0];
    if (targetRel) {
      const resolved = path.resolve(fileDir, targetRel);
      assert(fs.existsSync(resolved), `Broken relative link in ${path.basename(file)}: ${match[1]} -> ${resolved}`);
    }
  }
}

console.log("Task 6 validation passed. All skill invariants verified successfully.");


