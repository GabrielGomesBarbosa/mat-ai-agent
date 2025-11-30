import type { PlannerOutput } from "../types/plannerTypes";

export function formatPlanToMarkdown(plan: PlannerOutput): string {
    const {
        task,
        summary,
        userStory,
        acceptanceCriteria,
        scope,
        implementation,
        tests,
        risks,
        dependencies,
        outOfScope,
        estimatedComplexity,
        missingInformation,
        confidence,
    } = plan;

    return `# Implementation Plan — Task ${task.id}: ${task.title}

## 📝 Summary
${summary}

## 🎯 User Story
${userStory}

## ✅ Acceptance Criteria
${acceptanceCriteria.map(i => `- ${i}`).join("\n")}

## 📦 Scope

### Screens
${scope.screens.map(i => `- ${i}`).join("\n")}

### Components
${scope.components.map(i => `- ${i}`).join("\n")}

### Modules
${scope.modules.map(i => `- ${i}`).join("\n")}

### API Calls
${scope.apiCalls.map(i => `- ${i}`).join("\n")}

## 🛠 Implementation Steps
${implementation.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

### Files to Create
${implementation.filesToCreate.map(i => `- ${i}`).join("\n")}

### Files to Modify
${implementation.filesToModify.map(i => `- ${i}`).join("\n")}

### Design System Notes
${implementation.designSystemNotes}

### Technical Constraints
${implementation.technicalConstraints.map(i => `- ${i}`).join("\n")}

## 🧪 Tests

### Unit Tests
${tests.unitTests.map(i => `- ${i}`).join("\n")}

### Integration Tests
${tests.integrationTests.map(i => `- ${i}`).join("\n")}

### Manual Checks
${tests.manualChecks.map(i => `- ${i}`).join("\n")}

## ⚠️ Risks
${risks.map(i => `- ${i}`).join("\n")}

## 🔗 Dependencies
${dependencies.map(i => `- ${i}`).join("\n")}

## 🚫 Out of Scope
${outOfScope.map(i => `- ${i}`).join("\n")}

## ❓ Missing Information
${missingInformation.map(i => `- ${i}`).join("\n")}

## 📊 Estimated Complexity
${estimatedComplexity}

## 🔢 Confidence Score
${confidence}
`;
}
