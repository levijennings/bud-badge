-- Bud Badge: Seed Data
-- Training Modules, Quizzes, and Sample Content
-- Created: 2026-04-03

-- ============================================================================
-- TRAINING MODULES
-- ============================================================================

-- Module 1: Cannabis Compliance Fundamentals
INSERT INTO training_modules (
  id,
  title,
  slug,
  description,
  category,
  difficulty,
  duration_minutes,
  content,
  passing_score,
  state_requirements,
  is_published,
  is_premium,
  version
) VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Cannabis Compliance Fundamentals',
  'cannabis-compliance-fundamentals',
  'Learn the essential regulatory framework for cannabis dispensaries, including federal vs. state regulations, licensing requirements, and compliance best practices.',
  'compliance',
  'beginner',
  45,
  '[
    {
      "type": "video",
      "title": "Introduction to Cannabis Regulations",
      "duration": 8,
      "description": "Overview of federal and state regulatory landscape"
    },
    {
      "type": "text",
      "title": "Key Regulatory Bodies",
      "content": "Understanding the role of the DEA, state cannabis boards, and local authorities"
    },
    {
      "type": "text",
      "title": "Licensing and Permits",
      "content": "Types of licenses, application processes, and renewal requirements"
    },
    {
      "type": "video",
      "title": "Record Keeping Requirements",
      "duration": 6,
      "description": "Understanding METRC and other tracking systems"
    },
    {
      "type": "interactive",
      "title": "Compliance Scenario",
      "description": "Interactive case study on handling compliance violations"
    }
  ]'::jsonb,
  70,
  ARRAY['CA', 'CO', 'OR', 'WA', 'MA'],
  TRUE,
  FALSE,
  1
);

-- Module 2: State Regulations Overview
INSERT INTO training_modules (
  id,
  title,
  slug,
  description,
  category,
  difficulty,
  duration_minutes,
  content,
  passing_score,
  state_requirements,
  is_published,
  is_premium,
  version
) VALUES (
  'a0000000-0000-0000-0000-000000000002'::uuid,
  'State Regulations Overview',
  'state-regulations-overview',
  'Deep dive into cannabis regulations specific to major dispensary states. Learn about testing requirements, packaging standards, and state-specific compliance obligations.',
  'compliance',
  'beginner',
  60,
  '[
    {
      "type": "text",
      "title": "California Cannabis Regulations",
      "content": "Proposition 64, CCPA, and California Code of Regulations Title 4"
    },
    {
      "type": "text",
      "title": "Colorado Cannabis Regulations",
      "content": "Colorado Retail Rules, MED Track and Trace system"
    },
    {
      "type": "text",
      "title": "Oregon Cannabis Regulations",
      "content": "Oregon Liquor & Cannabis Commission (OLCC) rules"
    },
    {
      "type": "text",
      "title": "Testing and Quality Standards",
      "content": "State mandated testing, potency labeling, pesticide screening"
    },
    {
      "type": "text",
      "title": "Packaging and Labeling",
      "content": "Mandatory warnings, THC/CBD disclosure, child-resistant packaging"
    }
  ]'::jsonb,
  70,
  ARRAY['CA', 'CO', 'OR', 'WA', 'MA'],
  TRUE,
  FALSE,
  1
);

-- Module 3: Terpene Profiles & Effects
INSERT INTO training_modules (
  id,
  title,
  slug,
  description,
  category,
  difficulty,
  duration_minutes,
  content,
  passing_score,
  state_requirements,
  is_published,
  is_premium,
  version
) VALUES (
  'a0000000-0000-0000-0000-000000000003'::uuid,
  'Terpene Profiles & Effects',
  'terpene-profiles-effects',
  'Understand cannabis terpenes and their effects on the user experience. Learn about common terpene profiles, their aromatic and therapeutic properties, and how they influence the overall cannabis effect.',
  'product_knowledge',
  'intermediate',
  50,
  '[
    {
      "type": "video",
      "title": "Introduction to Terpenes",
      "duration": 10,
      "description": "What are terpenes and why they matter in cannabis"
    },
    {
      "type": "text",
      "title": "Common Terpenes",
      "content": "Myrcene, limonene, pinene, caryophyllene, humulene, and linalool profiles"
    },
    {
      "type": "text",
      "title": "Entourage Effect",
      "content": "How terpenes and cannabinoids work together to produce effects"
    },
    {
      "type": "interactive",
      "title": "Terpene Flavor & Aroma Guide",
      "description": "Interactive guide to identifying terpenes by smell and taste"
    },
    {
      "type": "text",
      "title": "Medical Applications",
      "content": "Terpenes for pain, anxiety, sleep, and anti-inflammation"
    }
  ]'::jsonb,
  70,
  ARRAY[]::text[],
  TRUE,
  TRUE,
  1
);

-- Module 4: Indica vs Sativa vs Hybrid
INSERT INTO training_modules (
  id,
  title,
  slug,
  description,
  category,
  difficulty,
  duration_minutes,
  content,
  passing_score,
  state_requirements,
  is_published,
  is_premium,
  version
) VALUES (
  'a0000000-0000-0000-0000-000000000004'::uuid,
  'Indica vs Sativa vs Hybrid',
  'indica-sativa-hybrid',
  'Master the differences between cannabis plant types and their effects. Learn how to guide customers to the right product based on their needs and preferences.',
  'product_knowledge',
  'beginner',
  40,
  '[
    {
      "type": "video",
      "title": "Plant Anatomy and Origins",
      "duration": 8,
      "description": "History and geographic origins of Indica and Sativa"
    },
    {
      "type": "text",
      "title": "Sativa Effects and Characteristics",
      "content": "Uplifting, energetic, creative effects; daytime use; taller plant structure"
    },
    {
      "type": "text",
      "title": "Indica Effects and Characteristics",
      "content": "Relaxing, sedating effects; nighttime use; shorter, bushier plant structure"
    },
    {
      "type": "text",
      "title": "Hybrid Genetics",
      "content": "Balanced effects, popular strains, finding the right hybrid ratio"
    },
    {
      "type": "interactive",
      "title": "Customer Recommendation Quiz",
      "description": "Practice recommending products based on customer profiles"
    }
  ]'::jsonb,
  70,
  ARRAY[]::text[],
  TRUE,
  FALSE,
  1
);

-- Module 5: Customer Consultation Best Practices
INSERT INTO training_modules (
  id,
  title,
  slug,
  description,
  category,
  difficulty,
  duration_minutes,
  content,
  passing_score,
  state_requirements,
  is_published,
  is_premium,
  version
) VALUES (
  'a0000000-0000-0000-0000-000000000005'::uuid,
  'Customer Consultation Best Practices',
  'customer-consultation-best-practices',
  'Develop expert customer service skills for cannabis retail. Learn consultation techniques, active listening, product recommendations, and handling sensitive customer needs.',
  'customer_service',
  'intermediate',
  55,
  '[
    {
      "type": "video",
      "title": "Budtender Communication Skills",
      "duration": 12,
      "description": "Effective communication and building customer rapport"
    },
    {
      "type": "text",
      "title": "Needs Assessment Framework",
      "content": "Questions to ask: usage frequency, experience level, consumption method, desired effects"
    },
    {
      "type": "text",
      "title": "Product Recommendation Techniques",
      "content": "Matching customer needs to products, upselling responsibly, explaining value"
    },
    {
      "type": "interactive",
      "title": "Consultation Scenarios",
      "description": "Role-play scenarios for common customer interactions"
    },
    {
      "type": "text",
      "title": "Handling Difficult Customers",
      "content": "Managing complaints, setting boundaries, escalation procedures"
    },
    {
      "type": "text",
      "title": "Compliance in Conversations",
      "content": "What you can and cannot say, health claims, liability"
    }
  ]'::jsonb,
  75,
  ARRAY[]::text[],
  TRUE,
  FALSE,
  1
);

-- Module 6: Safe Handling & Storage
INSERT INTO training_modules (
  id,
  title,
  slug,
  description,
  category,
  difficulty,
  duration_minutes,
  content,
  passing_score,
  state_requirements,
  is_published,
  is_premium,
  version
) VALUES (
  'a0000000-0000-0000-0000-000000000006'::uuid,
  'Safe Handling & Storage',
  'safe-handling-storage',
  'Learn critical safety and storage procedures for cannabis products. Understand environmental controls, inventory management, security protocols, and preventing contamination.',
  'safety',
  'beginner',
  50,
  '[
    {
      "type": "video",
      "title": "Storage Environment Requirements",
      "duration": 10,
      "description": "Temperature, humidity, light exposure, and air quality"
    },
    {
      "type": "text",
      "title": "Proper Storage Containers",
      "content": "Glass vs. plastic, sealed containers, desiccants, preventing degradation"
    },
    {
      "type": "text",
      "title": "Inventory Management",
      "content": "FIFO method, rotating stock, tracking shelf life, handling damaged products"
    },
    {
      "type": "video",
      "title": "Security and Loss Prevention",
      "duration": 8,
      "description": "Preventing theft, handling cash, checking IDs, surveillance"
    },
    {
      "type": "text",
      "title": "Contamination Prevention",
      "content": "Hygiene protocols, cross-contamination risks, glove usage, cleaning procedures"
    },
    {
      "type": "text",
      "title": "Accident Response",
      "content": "Spillage, exposure incidents, reporting requirements, first aid"
    }
  ]'::jsonb,
  70,
  ARRAY['CA', 'CO', 'OR', 'WA', 'MA'],
  TRUE,
  FALSE,
  1
);

-- ============================================================================
-- QUIZZES
-- ============================================================================

-- Quiz for Cannabis Compliance Fundamentals
INSERT INTO quizzes (
  id,
  module_id,
  title,
  questions,
  time_limit_minutes
) VALUES (
  'b0000000-0000-0000-0000-000000000001'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Cannabis Compliance Fundamentals Quiz',
  '[
    {
      "question": "Which federal agency has primary jurisdiction over cannabis?",
      "options": [
        "FDA",
        "DEA",
        "EPA",
        "OSHA"
      ],
      "correct_answer": 1,
      "explanation": "The Drug Enforcement Administration (DEA) has primary federal jurisdiction over cannabis."
    },
    {
      "question": "What is the primary purpose of METRC?",
      "options": [
        "Track and trace cannabis products",
        "Test cannabinoid potency",
        "Store customer data",
        "Manage employee schedules"
      ],
      "correct_answer": 0,
      "explanation": "METRC (Marijuana Enforcement Tracking Reporting Compliance) is used to track cannabis products from seed to sale."
    },
    {
      "question": "True or False: Cannabis regulations are the same across all states.",
      "options": [
        "True",
        "False"
      ],
      "correct_answer": 1,
      "explanation": "Cannabis regulations vary significantly by state. Each state has its own rules and requirements."
    },
    {
      "question": "What is the typical validity period for a cannabis dispensary license?",
      "options": [
        "1 year",
        "2 years",
        "3 years",
        "5 years"
      ],
      "correct_answer": 2,
      "explanation": "Most states issue cannabis dispensary licenses for 2-3 year periods, varying by state."
    },
    {
      "question": "Which records must be maintained by a legal dispensary?",
      "options": [
        "Only sales records",
        "Only inventory records",
        "Sales, inventory, testing, and customer records",
        "No records are required"
      ],
      "correct_answer": 2,
      "explanation": "Dispensaries must maintain comprehensive records including sales, inventory, test results, and for compliance verification."
    }
  ]'::jsonb,
  20
);

-- Quiz for Indica vs Sativa vs Hybrid
INSERT INTO quizzes (
  id,
  module_id,
  title,
  questions,
  time_limit_minutes
) VALUES (
  'b0000000-0000-0000-0000-000000000004'::uuid,
  'a0000000-0000-0000-0000-000000000004'::uuid,
  'Indica vs Sativa vs Hybrid Quiz',
  '[
    {
      "question": "Which plant type is typically associated with uplifting and energetic effects?",
      "options": [
        "Indica",
        "Sativa",
        "Hybrid",
        "Ruderalis"
      ],
      "correct_answer": 1,
      "explanation": "Sativa strains are typically associated with uplifting, energetic, and creative effects, making them better for daytime use."
    },
    {
      "question": "Indica plants are characterized by:",
      "options": [
        "Tall and thin structure with thin leaves",
        "Short and bushy structure with broad leaves",
        "Medium height with mixed leaf characteristics",
        "Very large leaves and flowers"
      ],
      "correct_answer": 1,
      "explanation": "Indica plants are typically shorter and bushier with broader leaves, adapted to cooler climates."
    },
    {
      "question": "What are hybrids?",
      "options": [
        "Genetically modified cannabis",
        "Cannabis that has been crossbred from Indica and Sativa",
        "Cannabis with no cannabinoids",
        "Artificial cannabis products"
      ],
      "correct_answer": 1,
      "explanation": "Hybrids are created by crossbreeding Indica and Sativa plants, combining effects from both parent plants."
    },
    {
      "question": "True or False: A customer wanting to relax in the evening should typically use a Sativa.",
      "options": [
        "True",
        "False"
      ],
      "correct_answer": 1,
      "explanation": "False. Indicas are typically better for evening/relaxation due to their sedating effects. Sativas are more energizing."
    },
    {
      "question": "What percentage THC typically indicates a hybrid product?",
      "options": [
        "Determined solely by plant type",
        "Always exactly 50% Indica / 50% Sativa",
        "Varies - determined by the specific cross and cultivation",
        "Cannot be determined from THC percentage alone"
      ],
      "correct_answer": 2,
      "explanation": "Hybrid ratios vary widely and cannot be determined solely from THC percentage. The specific cross and cultivation methods matter."
    }
  ]'::jsonb,
  15
);

-- Quiz for Safe Handling & Storage
INSERT INTO quizzes (
  id,
  module_id,
  title,
  questions,
  time_limit_minutes
) VALUES (
  'b0000000-0000-0000-0000-000000000006'::uuid,
  'a0000000-0000-0000-0000-000000000006'::uuid,
  'Safe Handling & Storage Quiz',
  '[
    {
      "question": "What is the ideal humidity level for cannabis storage?",
      "options": [
        "20-30%",
        "45-55%",
        "70-80%",
        "90-100%"
      ],
      "correct_answer": 1,
      "explanation": "45-55% relative humidity is ideal for cannabis storage to prevent mold while maintaining potency."
    },
    {
      "question": "What temperature range is recommended for cannabis storage?",
      "options": [
        "Room temperature (68-72°F)",
        "Cool and dark (50-60°F)",
        "Frozen (below 32°F)",
        "Warm (above 80°F)"
      ],
      "correct_answer": 1,
      "explanation": "Cool temperatures (50-60°F) in darkness help preserve cannabinoids and prevent degradation."
    },
    {
      "question": "What does FIFO stand for in inventory management?",
      "options": [
        "First In, First Out",
        "Final Inventory File Organization",
        "Frequent Inventory Follow-up",
        "Food Industry Footage Overview"
      ],
      "correct_answer": 0,
      "explanation": "FIFO (First In, First Out) ensures older products are sold before newer ones, preventing expiration."
    },
    {
      "question": "Which container type is best for long-term cannabis storage?",
      "options": [
        "Clear plastic bags",
        "Cardboard boxes",
        "Opaque glass jars with airtight seals",
        "Metal containers"
      ],
      "correct_answer": 2,
      "explanation": "Opaque (dark) glass jars with airtight seals protect from light while maintaining product integrity."
    },
    {
      "question": "If cannabis is exposed to light during storage, what happens?",
      "options": [
        "Nothing significant",
        "THC and CBD degrade, reducing potency",
        "The product becomes more potent",
        "All cannabinoids are destroyed immediately"
      ],
      "correct_answer": 1,
      "explanation": "Light exposure causes photodegradation of cannabinoids, particularly THC, reducing product potency over time."
    }
  ]'::jsonb,
  18
);

-- ============================================================================
-- NOTES
-- ============================================================================

-- Seed data includes:
-- - 6 training modules covering compliance, product knowledge, customer service, and safety
-- - 3 quizzes with 5 questions each (for modules 1, 4, and 6)
-- - Additional quizzes can be created for modules 2, 3, and 5 as needed
--
-- To add more quizzes:
-- 1. Insert quiz records with references to module_id
-- 2. Populate questions array with quiz question objects
--
-- Quiz question object structure:
-- {
--   "question": "Question text",
--   "options": ["option1", "option2", "option3", "option4"],
--   "correct_answer": 0,  -- index of correct option (0-based)
--   "explanation": "Why this is correct"
-- }

COMMIT;
