export const plannerOutputJsonSchema = {
    type: "object",
    properties: {
        task: {
            type: "object",
            properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
            },
            required: ["id", "title", "description"],
            additionalProperties: false,
        },

        summary: { type: "string" },
        userStory: { type: "string" },

        acceptanceCriteria: {
            type: "array",
            items: { type: "string" },
        },

        scope: {
            type: "object",
            properties: {
                featureType: { type: "string" },
                frontendType: { type: "string" },
                screens: { type: "array", items: { type: "string" } },
                components: { type: "array", items: { type: "string" } },
                modules: { type: "array", items: { type: "string" } },
                apiCalls: { type: "array", items: { type: "string" } },
            },
            required: [
                "featureType",
                "frontendType",
                "screens",
                "components",
                "modules",
                "apiCalls",
            ],
            additionalProperties: false,
        },

        implementation: {
            type: "object",
            properties: {
                steps: { type: "array", items: { type: "string" } },
                filesToCreate: { type: "array", items: { type: "string" } },
                filesToModify: { type: "array", items: { type: "string" } },
                designSystemNotes: { type: "string" },
                technicalConstraints: {
                    type: "array",
                    items: { type: "string" },
                },
            },
            required: [
                "steps",
                "filesToCreate",
                "filesToModify",
                "designSystemNotes",
                "technicalConstraints",
            ],
            additionalProperties: false,
        },

        tests: {
            type: "object",
            properties: {
                unitTests: { type: "array", items: { type: "string" } },
                integrationTests: { type: "array", items: { type: "string" } },
                manualChecks: { type: "array", items: { type: "string" } },
            },
            required: ["unitTests", "integrationTests", "manualChecks"],
            additionalProperties: false,
        },

        risks: { type: "array", items: { type: "string" } },
        dependencies: { type: "array", items: { type: "string" } },
        outOfScope: { type: "array", items: { type: "string" } },

        estimatedComplexity: {
            type: "string",
            enum: ["low", "medium", "high"],
        },

        missingInformation: { type: "array", items: { type: "string" } },

        confidence: { type: "number" },
    },

    required: [
        "task",
        "summary",
        "userStory",
        "acceptanceCriteria",
        "scope",
        "implementation",
        "tests",
        "risks",
        "dependencies",
        "outOfScope",
        "estimatedComplexity",
        "missingInformation",
        "confidence",
    ],

    additionalProperties: false,
};
