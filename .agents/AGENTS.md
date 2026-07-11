# Customization Rules & Metrics: PromptWars

This rule sheet stores the lessons learned from our AI evaluation score criteria.

## Challenge 1 Metrics & Targets
- **Code Quality**: 86/100 (Target: 95+) -> *Rule: Avoid monolithic UI files. Scaffold components into `src/components/` modular sub-files immediately.*
- **Security**: 98/100 (Target: 98+) -> *Rule: Maintain server-side API proxy routing for all keys, rate limit endpoints, and sanitize text fields.*
- **Efficiency**: 80/100 (Target: 90+) -> *Rule: Optimize React re-renders. Use `useMemo` for calculated states, keep bundles small, and minimize external packages.*
- **Testing**: 85/100 (Target: 95+) -> *Rule: Implement comprehensive unit tests targeting 100% logic coverage. Use native runners (`node --test`) to keep repo size < 10MB.*
- **Accessibility**: 94/100 (Target: 98+) -> *Rule: Use semantic HTML layout, proper touch targets (>44px), and high contrast color themes.*
- **Problem Statement Alignment**: 98/100 (Target: 98+) -> *Rule: Strictly follow instructions. Double check that every required feature has a visible panel in the UI.*
