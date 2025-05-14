graph TD
    subgraph "Build Time"
        A["Code + Data"] --> B("Next.js Build");
        B -- SSG --> C["Static HTML Files (for SSG/ISR pages)"];
        B -- ISR --> C;  // 更明确地标注ISR路径
    end

    subgraph "Request Time"
        D["User Request"] --> E{Route Match?};
        E -- Yes --> F{Page Rendering Strategy?};
        F -- SSG/ISR (Cached) --> G["Serve Static/Cached HTML"];
        F -- SSR / ISR (Stale/Uncached) --> H["Server Renders Page"];
        H --> I["Serve Generated HTML"];
        F -- CSR (Client-Side Only) --> J["Serve Minimal HTML + JS Bundle"];
        E -- No --> K["404 Not Found"];
    end

    subgraph "Client-Side"
      G --> L["Hydration (React attaches)"];
      I --> L;
      J --> M["React Renders in Browser"];
    end