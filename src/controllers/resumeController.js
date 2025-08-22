const Resume = require("../models/resume");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");

async function parseResume(filePath, mimetype) {
  let text = "";

  try {
    console.log(`Parsing file: ${filePath}, type: ${mimetype}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error("Uploaded file not found");
    }

    // Parse based on file type
    if (mimetype.includes("pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else if (mimetype.includes("word") || mimetype.includes("docx") || mimetype.includes("openxmlformats")) {
      // Multiple strategies for DOCX parsing
      let extractionSuccessful = false;
      
      // Strategy 1: Raw text extraction
      try {
        console.log("Trying raw text extraction...");
        const result = await mammoth.extractRawText({ path: filePath });
        if (result.value && result.value.trim().length > 10) {
          text = result.value;
          extractionSuccessful = true;
        }
      } catch (rawError) {
        console.log("Raw text extraction failed:", rawError.message);
      }
      
      // Strategy 2: HTML conversion if raw text failed or insufficient
      if (!extractionSuccessful) {
        try {
          console.log("Trying HTML conversion...");
          const htmlResult = await mammoth.convertToHtml({ 
            path: filePath,
            options: {
              convertImage: mammoth.images.ignoreImages
            }
          });
          
          if (htmlResult.value && htmlResult.value.length > 10) {
            text = htmlResult.value
              .replace(/<img[^>]*>/gi, '')
              .replace(/<[^>]*>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (text.length > 10) {
              extractionSuccessful = true;
            }
          }
        } catch (htmlError) {
          console.log("HTML conversion failed:", htmlError.message);
        }
      }
      
      if (!extractionSuccessful) {
        throw new Error("Unable to extract text from DOCX file");
      }
    } else {
      throw new Error("Unsupported file type. Only PDF and Word documents are allowed.");
    }

    text = cleanText(text);
    
    if (!text || text.trim().length < 10) {
      throw new Error(`No readable text content found in the file. Extracted length: ${text?.length || 0}`);
    }

    const parsedData = {
      rawText: text,
      personalInfo: {},
      sections: {},
      metadata: {
        fileType: mimetype,
        extractedAt: new Date(),
        textLength: text.length
      }
    };

    extractPersonalInfo(text, parsedData);
    extractSections(text, parsedData);

    return parsedData;

  } catch (error) {
    console.error("Resume parsing error:", error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

function cleanText(text) {
  if (!text) return "";
  
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\f/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n[ \t]*\n/g, '\n\n')
    .replace(/^[ \t]+/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/•/g, '• ')
    .replace(/^\s*[•\-*+]\s*/gm, '• ')
    .trim();
}

function extractPersonalInfo(text, parsedData) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  extractName(lines, parsedData);
  extractEmail(text, parsedData);
  extractPhone(text, parsedData);
  extractLocation(text, parsedData);
  extractSocialProfiles(text, parsedData);
}

function extractName(lines, parsedData) {
  const skipPatterns = /^(resume|cv|curriculum|vitae|profile|contact|personal|summary|objective|about|skills|experience|education|technical|knowledge|client|server|building|version|control|ide|html|css|javascript|react|node|mongodb|mysql|aws|npm|github|gitlab|visual|studio|code)$/i;
  
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip common resume words, emails, phone numbers, and short lines
    if (skipPatterns.test(line) || 
        line.includes('@') || 
        line.match(/\d{3}/) || 
        line.length < 3 ||
        line.includes('http') ||
        line.includes('www') ||
        line.includes('.com') ||
        line.includes('•') ||
        line.toLowerCase().includes('developer') ||
        line.toLowerCase().includes('stack') ||
        line.toLowerCase().includes('web')) {
      continue;
    }
    
    // Look for proper name format - all caps or proper case
    if ((line.match(/^[A-Z]+(?:\s+[A-Z]+){1,4}$/) || 
         line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}$/)) && 
        !line.match(/[0-9@]/) &&
        line.split(' ').length <= 4) {
      parsedData.personalInfo.name = line.trim();
      break;
    }
  }
}

function extractEmail(text, parsedData) {
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/);
  if (emailMatch) {
    parsedData.personalInfo.email = emailMatch[1].toLowerCase();
  }
}

function extractPhone(text, parsedData) {
  const phonePatterns = [
    /(\+\d{1,3}[-.\s]?\d{8,14})/,
    /(\(\d{3}\)\s*\d{3}[-.\s]?\d{4})/,
    /(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/,
    /(\d{2}\s+\d{5}\s+\d{5})/,  // Indian format like "91 99097 52650"
    /(\d{10,12})/
  ];

  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match && match[1].replace(/\D/g, '').length >= 10) {
      parsedData.personalInfo.phone = match[1].trim();
      break;
    }
  }
}

function extractLocation(text, parsedData) {
  const locationPatterns = [
    // Full address patterns
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+Road,\s*[A-Z][a-z]+,\s*[A-Z][a-z]+(?:-\d+)?)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+,\s*[A-Z][a-z]+(?:-\d+)?)/,
    // State, Country patterns
    /([A-Z][a-z]+,\s*[A-Z][a-z]+,\s*[A-Z]{2}\s*\d{5})/,
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/,
    // Indian address patterns
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*India(?:-\d+)?)/i
  ];

  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && !match[1].includes('Stack') && !match[1].includes('React') && !match[1].includes('Node')) {
      parsedData.personalInfo.location = match[1].trim();
      break;
    }
  }
}

function extractSocialProfiles(text, parsedData) {
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/([a-zA-Z0-9-]+))/i);
  if (linkedinMatch) {
    parsedData.personalInfo.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
  }

  const githubMatch = text.match(/(?:github\.com\/([a-zA-Z0-9-]+))/i);
  if (githubMatch) {
    parsedData.personalInfo.github = `https://github.com/${githubMatch[1]}`;
  }

  // More specific portfolio matching to avoid false positives
  const portfolioMatch = text.match(/(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
  if (portfolioMatch && 
      !portfolioMatch[1].includes('linkedin') && 
      !portfolioMatch[1].includes('github') &&
      !portfolioMatch[1].includes('gmail') &&
      !portfolioMatch[1].includes('yahoo') &&
      !portfolioMatch[1].includes('hotmail')) {
    parsedData.personalInfo.portfolio = portfolioMatch[1];
  }
}

function extractSections(text, parsedData) {
  // Enhanced section headers with more comprehensive patterns
  const sectionHeaders = {
    summary: /^(?:summary|profile|about|overview|career\s*objective|professional\s*summary|personal\s*statement|objective|career\s*summary|professional\s*profile)$/i,
    skills: /^(?:(?:technical\s*)?skills|competencies|technologies|expertise|core\s*competencies|technical\s*competencies|technical\s*skills|skills\s*summary|key\s*skills|relevant\s*skills|technical\s*knowledge)$/i,
    experience: /^(?:(?:work\s*|professional\s*)?experience|employment|work\s*history|professional\s*background|career\s*history|employment\s*history|professional\s*experience|certification\s*course)$/i,
    education: /^(?:education|academic\s*background|qualifications|educational\s*background|degrees|academic\s*qualifications|educational\s*qualifications)$/i,
    certifications: /^(?:certifications?|certificates?|licenses?|awards?|achievements?|honors?|professional\s*certifications?|credentials)$/i,
    projects: /^(?:projects?|key\s*projects?|selected\s*projects?|notable\s*projects?|personal\s*projects?|relevant\s*projects?|portfolio)$/i,
    languages: /^(?:languages?|language\s*skills?|foreign\s*languages?)$/i,
    interests: /^(?:interests?|hobbies|personal\s*interests?|activities|extracurricular|other\s*interests?|interpersonal\s*skills)$/i,
    volunteer: /^(?:volunteer|volunteering|community\s*service|volunteer\s*experience|volunteer\s*work)$/i,
    publications: /^(?:publications?|papers?|research|articles?)$/i
  };

  const lines = text.split('\n');
  const sections = {};
  
  // First pass: detect all section headers and their positions
  const sectionPositions = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const detectedSection = detectSectionHeader(line, sectionHeaders);
    if (detectedSection) {
      sectionPositions.push({
        section: detectedSection,
        line: i,
        header: line
      });
    }
  }

  console.log('Detected sections:', sectionPositions);

  // Second pass: extract content between sections
  for (let i = 0; i < sectionPositions.length; i++) {
    const currentPos = sectionPositions[i];
    const nextPos = sectionPositions[i + 1];
    
    const startLine = currentPos.line + 1;
    const endLine = nextPos ? nextPos.line : lines.length;
    
    const content = [];
    for (let j = startLine; j < endLine; j++) {
      const line = lines[j].trim();
      // Filter out lines that look like other section headers or contact info
      if (line && 
          !isLikelySectionHeader(line) && 
          !line.includes('@') && 
          !line.match(/^www\./) &&
          !line.match(/^\d+\s+\d+/) && // Phone numbers
          !line.includes('linkedin.com') &&
          !line.includes('github.com')) {
        content.push(line);
      }
    }
    
    if (content.length > 0) {
      const processedContent = processSectionContent(currentPos.section, content.join('\n'));
      if (processedContent && 
          ((typeof processedContent === 'string' && processedContent.trim().length > 5) ||
           (typeof processedContent === 'object' && Object.keys(processedContent).length > 0) ||
           (Array.isArray(processedContent) && processedContent.length > 0))) {
        sections[currentPos.section] = processedContent;
      }
    }
  }

  // Handle duplicate sections (like multiple "projects") by merging them
  const finalSections = {};
  for (const [key, value] of Object.entries(sections)) {
    if (finalSections[key]) {
      if (typeof finalSections[key] === 'string' && typeof value === 'string') {
        finalSections[key] += '\n\n' + value;
      }
    } else {
      finalSections[key] = value;
    }
  }

  // If no sections were detected, try to extract a summary from the beginning
  if (Object.keys(finalSections).length === 0) {
    const potentialSummary = extractPotentialSummary(text);
    if (potentialSummary) {
      finalSections.summary = potentialSummary;
    }
  }

  parsedData.sections = finalSections;
}

function detectSectionHeader(line, sectionHeaders) {
  const cleanLine = line
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Must be reasonable length for a header
  if (cleanLine.length < 3 || cleanLine.length > 60) return null;
  
  // Check if line looks like a header (short, potentially capitalized)
  const originalLine = line.trim();
  const isAllCaps = originalLine === originalLine.toUpperCase() && originalLine.length > 2;
  const isCapitalized = /^[A-Z]/.test(originalLine);
  const isShort = originalLine.length < 50;
  const hasColon = originalLine.includes(':');
  
  // More likely to be a header if it's caps, capitalized, short, or has colon
  const headerLikelihood = isAllCaps || (isCapitalized && isShort) || hasColon;
  
  // Don't treat long sentences as headers unless they clearly match patterns
  if (!headerLikelihood && cleanLine.split(' ').length > 6) {
    return null;
  }

  // Special handling for "TECHNICAL KNOWLEDGE" type headers
  if (cleanLine.includes('technical') && cleanLine.includes('knowledge')) {
    return 'skills';
  }

  // Handle "CERTIFICATION COURSE" as experience
  if (cleanLine.includes('certification') && cleanLine.includes('course')) {
    return 'experience';
  }

  // Handle "INTERPERSONAL SKILLS" as interests/soft skills
  if (cleanLine.includes('interpersonal') && cleanLine.includes('skills')) {
    return 'interests';
  }

  for (const [sectionType, pattern] of Object.entries(sectionHeaders)) {
    if (pattern.test(cleanLine)) {
      return sectionType;
    }
  }

  return null;
}

function isLikelySectionHeader(line) {
  const headerIndicators = /^(?:summary|skills|experience|education|projects|certifications|languages|interests|objective|profile|about|volunteer|publications|awards|achievements|honors|technical|certification|course|interpersonal|basic|info)/i;
  const cleanLine = line.trim().toLowerCase().replace(/[^\w\s]/g, ' ');
  return headerIndicators.test(cleanLine) && line.length < 60;
}

function processSectionContent(sectionType, content) {
  const cleanContent = content
    .replace(/^[•\-*+]\s*/gm, '• ')
    .replace(/^\d+\.\s*/gm, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  try {
    switch (sectionType) {
      case 'skills':
        return processSkillsSection(cleanContent);
      case 'education':
        return processEducationSection(cleanContent);
      case 'experience':
        return processExperienceSection(cleanContent);
      case 'projects':
        return processProjectsSection(cleanContent);
      case 'certifications':
        return processCertificationsSection(cleanContent);
      default:
        return cleanContent;
    }
  } catch (error) {
    console.error(`Error processing ${sectionType} section:`, error);
    return cleanContent; // Fallback to original content
  }
}

function processSkillsSection(content) {
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    // Filter out contact info, addresses, and unrelated content
    return trimmed && 
           !trimmed.includes('@') && 
           !trimmed.includes('Road') &&
           !trimmed.includes('India') &&
           !trimmed.match(/^\d+\s+\d+/) &&
           !trimmed.includes('linkedin') &&
           !trimmed.includes('github') &&
           !trimmed.includes('Felix') &&
           !trimmed.includes('System') &&
           !trimmed.includes('May-2024') &&
           !trimmed.includes('Presená');
  });
  
  const skillCategories = {};
  let currentCategory = 'General';
  let allSkills = [];

  for (const line of lines) {
    const trimmedLine = line.trim().replace(/^[V•]\s*/, ''); // Remove V bullets
    
    // Check if line is a category (ends with colon or contains category keywords)
    if (trimmedLine.match(/^[^:]+:\s*$/) || 
        trimmedLine.match(/^(Client[-\s]?Side|Server[-\s]?Side|Front[-\s]?end|Back[-\s]?end|Building\s*Tool|Version\s*Control|IDE'?s?|Database|Framework|Library|Language):\s*$/i)) {
      currentCategory = trimmedLine.replace(/:\s*$/, '').trim();
      skillCategories[currentCategory] = [];
    } else if (trimmedLine.match(/^[^:]+:\s*(.+)$/)) {
      // Category with skills on same line
      const match = trimmedLine.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        currentCategory = match[1].trim();
        const skills = match[2].split(/[,•\-|]\s*/).filter(s => s.trim().length > 0);
        skillCategories[currentCategory] = skills;
      }
    } else if (trimmedLine.length > 0 && !trimmedLine.includes('Basic Info')) {
      // Parse skills from line
      const skills = trimmedLine
        .split(/[,•\-|]\s*/)
        .filter(s => s.trim().length > 0 && s.trim().length < 30) // Reasonable skill name length
        .map(s => s.trim());
      
      if (skills.length > 0) {
        if (!skillCategories[currentCategory]) {
          skillCategories[currentCategory] = [];
        }
        skillCategories[currentCategory].push(...skills);
        allSkills.push(...skills);
      }
    }
  }

  // Return categorized skills if we have meaningful categories
  if (Object.keys(skillCategories).length > 1 || 
      (Object.keys(skillCategories).length === 1 && 
       skillCategories[Object.keys(skillCategories)[0]].length > 2)) {
    
    // Format as readable text with categories
    return Object.entries(skillCategories)
      .filter(([category, skills]) => skills.length > 0)
      .map(([category, skills]) => `${category}: ${skills.join(', ')}`)
      .join('\n');
  }
  
  // Return as string if no structured data found
  return allSkills.length > 0 ? allSkills.join(', ') : content;
}

function processEducationSection(content) {
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.includes('@') && 
           !trimmed.includes('linkedin') &&
           !trimmed.includes('github') &&
           !trimmed.match(/^\d+\s+\d+/);
  });
  
  const educationItems = [];
  let currentItem = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Degree pattern
    if (trimmedLine.match(/^(Bachelor|Master|PhD|B\.S|B\.A|M\.S|M\.A|M\.B\.A|MBA|Higher\s*Secondary)/i)) {
      if (Object.keys(currentItem).length > 0) {
        educationItems.push(currentItem);
      }
      currentItem = { degree: trimmedLine };
    }
    // Institution pattern
    else if (trimmedLine.match(/(University|College|Institute|School)/i) && !currentItem.institution) {
      currentItem.institution = trimmedLine;
    }
    // Year pattern
    else if (trimmedLine.match(/\b(19|20)\d{2}(?:\s*-\s*(19|20)\d{2})?\b/) && !currentItem.year) {
      const yearMatch = trimmedLine.match(/\b(19|20)\d{2}(?:\s*-\s*(19|20)\d{2})?\b/);
      currentItem.year = yearMatch[0];
    }
    // GPA pattern
    else if (trimmedLine.match(/GPA|Grade/i)) {
      currentItem.gpa = trimmedLine;
    }
    // Other details (but filter out unrelated content)
    else if (trimmedLine.length > 0 && 
             !currentItem.details && 
             !trimmedLine.includes('Applications') &&
             trimmedLine.length < 100) {
      currentItem.details = trimmedLine;
    }
  }

  if (Object.keys(currentItem).length > 0) {
    educationItems.push(currentItem);
  }

  // Return structured data if parsed successfully, otherwise return original content
  if (educationItems.length > 0) {
    return educationItems.map(item => {
      let result = '';
      if (item.degree) result += item.degree;
      if (item.institution) result += (result ? '\n' : '') + item.institution;
      if (item.year) result += (result ? '\n' : '') + item.year;
      if (item.gpa) result += (result ? '\n' : '') + item.gpa;
      if (item.details) result += (result ? '\n' : '') + item.details;
      return result;
    }).join('\n\n');
  }
  
  return content;
}

function processExperienceSection(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const experiences = [];
  let currentExp = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Company or job title
    if (trimmedLine.match(/^[A-Z]/) && !trimmedLine.match(/^•/) && !currentExp.title) {
      if (Object.keys(currentExp).length > 0) {
        experiences.push(currentExp);
      }
      currentExp = { title: trimmedLine };
    }
    // Date range
    else if (trimmedLine.match(/\b(19|20)\d{2}\b/) && !currentExp.duration) {
      const dateMatch = trimmedLine.match(/\b(19|20)\d{2}(?:\s*-\s*(?:(19|20)\d{2}|present|current))?\b/i);
      if (dateMatch) {
        currentExp.duration = dateMatch[0];
      }
    }
    // Bullet points or descriptions
    else if (trimmedLine.match(/^•/) || (currentExp.title && trimmedLine.length > 10)) {
      if (!currentExp.description) {
        currentExp.description = [];
      }
      currentExp.description.push(trimmedLine.replace(/^•\s*/, ''));
    }
  }

  if (Object.keys(currentExp).length > 0) {
    experiences.push(currentExp);
  }

  // Convert to string format for consistency
  if (experiences.length > 0) {
    return experiences.map(exp => {
      let result = '';
      if (exp.title) result += exp.title;
      if (exp.duration) result += (result ? '\n' : '') + exp.duration;
      if (exp.description && exp.description.length > 0) {
        result += (result ? '\n' : '') + exp.description.map(desc => '• ' + desc).join('\n');
      }
      return result;
    }).join('\n\n');
  }
  
  return content;
}

function processProjectsSection(content) {
  const lines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    // Filter out interpersonal skills and unrelated content
    return trimmed && 
           !trimmed.match(/^(Quick\s*Learner|Adaptability|Multitasker|Interpersonal\s*Skills)$/i) &&
           !trimmed.includes('@') &&
           !trimmed.includes('linkedin') &&
           !trimmed.includes('github');
  });
  
  const projects = [];
  let currentProject = {};

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Project title (usually not starting with bullet and looks like a title)
    if (!trimmedLine.match(/^•/) && 
        trimmedLine.length > 5 && 
        trimmedLine.length < 100 &&
        !currentProject.title &&
        !trimmedLine.includes('View Project') &&
        (trimmedLine.includes('-') || trimmedLine.includes('(') || /^[A-Z]/.test(trimmedLine))) {
      if (Object.keys(currentProject).length > 0) {
        projects.push(currentProject);
      }
      currentProject = { title: trimmedLine };
    }
    // Bullet points or descriptions (but not "View Project")
    else if ((trimmedLine.match(/^•/) || (currentProject.title && trimmedLine.length > 10)) &&
             !trimmedLine.includes('View Project')) {
      if (!currentProject.description) {
        currentProject.description = [];
      }
      currentProject.description.push(trimmedLine.replace(/^•\s*/, ''));
    }
  }

  if (Object.keys(currentProject).length > 0) {
    projects.push(currentProject);
  }

  // Convert to string format for consistency
  if (projects.length > 0) {
    return projects.map(project => {
      let result = '';
      if (project.title) result += project.title;
      if (project.description && project.description.length > 0) {
        result += (result ? '\n' : '') + project.description.map(desc => '• ' + desc).join('\n');
      }
      return result;
    }).join('\n\n');
  }
  
  return content;
}

function processCertificationsSection(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const certifications = [];

  for (const line of lines) {
    const trimmedLine = line.trim().replace(/^•\s*/, '');
    if (trimmedLine.length > 3) {
      certifications.push(trimmedLine);
    }
  }

  // Return as string joined by newlines for consistency
  return certifications.length > 0 ? certifications.join('\n') : content;
}

function extractPotentialSummary(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let summaryLines = [];
  let foundPersonalInfo = false;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    
    // Skip obvious headers and personal info
    if (isLikelySectionHeader(line) || 
        line.includes('@') || 
        line.match(/\d{3}/) ||
        line.length < 10) {
      foundPersonalInfo = true;
      continue;
    }

    // If we found personal info and this looks like a paragraph, it might be summary
    if (foundPersonalInfo && line.length > 30 && !line.match(/^[A-Z\s]+$/)) {
      summaryLines.push(line);
      // Look for a few more connected lines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.length > 20 && !isLikelySectionHeader(nextLine)) {
          summaryLines.push(nextLine);
        } else {
          break;
        }
      }
      break;
    }
  }

  return summaryLines.length > 0 ? summaryLines.join(' ') : null;
}

// Controller functions remain the same
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: "Unsupported file type. Please upload PDF or Word document." 
      });
    }

    const parsedData = await parseResume(req.file.path, req.file.mimetype);

    const resume = await Resume.create({
      originalFilename: req.file.originalname,
      parsedData,
      uploadedAt: new Date()
    });

    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.warn("Failed to cleanup uploaded file:", cleanupError.message);
    }

    res.status(201).json({
      message: "Resume uploaded and parsed successfully",
      resume: {
        id: resume._id,
        originalFilename: resume.originalFilename,
        parsedData: resume.parsedData,
        uploadedAt: resume.uploadedAt
      }
    });

  } catch (err) {
    console.error("Resume upload error:", err);
    
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.warn("Failed to cleanup failed upload:", cleanupError.message);
      }
    }

    res.status(500).json({ 
      message: "Failed to process resume",
      error: err.message 
    });
  }
};

exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find();
    res.json({ resume: resumes });
  } catch (err) {
    console.error("Get all resumes error:", err);
    res.status(500).json({ message: "Failed to retrieve resumes" });
  }
};

exports.getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .select('originalFilename parsedData.personalInfo parsedData.metadata uploadedAt')
      .sort({ uploadedAt: -1 });
    
    res.json({
      count: resumes.length,
      resumes: resumes
    });
  } catch (err) {
    console.error("Get user resumes error:", err);
    res.status(500).json({ message: "Failed to retrieve resumes" });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (err) {
    console.error("Get resume by ID error:", err);
    if (err.name === 'CastError') {
      return res.status(400).json({ message: "Invalid resume ID" });
    }
    res.status(500).json({ message: "Failed to retrieve resume" });
  }
};