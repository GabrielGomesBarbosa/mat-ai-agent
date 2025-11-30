export type PlannerTaskInfo = {
    id: string;
    title: string;
    description: string;
};

export type PlannerScope = {
    featureType: string;
    frontendType: string;
    screens: string[];
    components: string[];
    modules: string[];
    apiCalls: string[];
};

export type PlannerImplementation = {
    steps: string[];
    filesToCreate: string[];
    filesToModify: string[];
    designSystemNotes: string;
    technicalConstraints: string[];
};

export type PlannerTests = {
    unitTests: string[];
    integrationTests: string[];
    manualChecks: string[];
};

export type PlannerOutput = {
    task: PlannerTaskInfo;
    summary: string;
    userStory: string;
    acceptanceCriteria: string[];
    scope: PlannerScope;
    implementation: PlannerImplementation;
    tests: PlannerTests;
    risks: string[];
    dependencies: string[];
    outOfScope: string[];
    estimatedComplexity: "low" | "medium" | "high";
    missingInformation: string[];
    confidence: number;
};
