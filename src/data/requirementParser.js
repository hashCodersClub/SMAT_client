const cleanText = (text = "") => text.replace(/\s+/g, " ").trim();

const extractCity = (text) => {
  const cities = [
    "Delhi",
    "New Delhi",
    "Noida",
    "Greater Noida",
    "Gurgaon",
    "Gurugram",
    "Faridabad",
    "Ghaziabad",
    "Mumbai",
    "Pune",
    "Bangalore",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Jaipur",
    "Lucknow",
    "Bhopal",
    "Indore",
    "Ahmedabad",
    "Chandigarh",
    "Mohali",
    "Dehradun",
    "Patna",
    "Ranchi",
    "Bhubaneswar",
    "Kochi",
    "Coimbatore",
  ];

  return (
    cities.find((city) => text.toLowerCase().includes(city.toLowerCase())) || ""
  );
};

const extractMode = (text) => {
  const lower = text.toLowerCase();

  if (
    lower.includes("offline") ||
    lower.includes("onsite") ||
    lower.includes("on-site") ||
    lower.includes("classroom")
  ) {
    return "Offline";
  }

  if (
    lower.includes("online") ||
    lower.includes("remote") ||
    lower.includes("virtual")
  ) {
    return "Online";
  }

  if (lower.includes("hybrid")) {
    return "Hybrid";
  }

  return "";
};

const extractBudget = (text) => {
  const patterns = [
    /(?:budget|rate|commercial|pay|payment)\s*(?:is|:|-)?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*k?/i,
    /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*k?/i,
    /(\d+(?:\.\d+)?)\s*k\s*\/?\s*(?:day|daily|per day)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      let value = Number(match[1].replace(/,/g, ""));

      const fullMatch = match[0].toLowerCase();

      if (fullMatch.includes("k") && value < 1000) {
        value *= 1000;
      }

      return value;
    }
  }

  return "";
};

const extractExperience = (text) => {
  const patterns = [
    /(\d+)\+?\s*(?:years|year|yrs|yr)\s*(?:of\s*)?(?:experience|exp)/i,
    /(?:experience|exp)\s*(?:is|:|-)?\s*(\d+)\+?\s*(?:years|year|yrs|yr)?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return "";
};

const extractStudents = (text) => {
  const patterns = [
    /(\d+)\s*(?:students|student|participants|learners|candidates)/i,
    /(?:batch\s*size|students|participants)\s*(?:is|:|-)?\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return Number(match[1]);
    }
  }

  return "";
};

const extractSkills = (text) => {
  const skillDictionary = [
    "Python",
    "Java",
    "JavaScript",
    "React",
    "Angular",
    "Node.js",
    "Node",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Power BI",
    "Tableau",
    "Excel",
    "Advanced Excel",
    "Data Analytics",
    "Data Science",
    "Machine Learning",
    "Deep Learning",
    "Generative AI",
    "GenAI",
    "Artificial Intelligence",
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "DevOps",
    "Spring Boot",
    ".NET",
    "ASP.NET Core",
    "C#",
    "C++",
    "Cyber Security",
    "Cybersecurity",
    "Linux",
    "Git",
    "GitHub",
    "Django",
    "Flask",
    "FastAPI",
    "Spark",
    "PySpark",
    "Hadoop",
    "Databricks",
    "Snowflake",
  ];

  const lower = text.toLowerCase();

  return skillDictionary.filter((skill) => lower.includes(skill.toLowerCase()));
};

const monthMap = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

const toISODate = (day, monthText, year) => {
  const month = monthMap[monthText.toLowerCase()];

  if (month === undefined) return "";

  const resolvedYear = year || new Date().getFullYear();

  const date = new Date(resolvedYear, month, Number(day));

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");

  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
};

const extractDates = (text) => {
  /*
   * Examples:
   * 10 Aug to 15 Aug
   * 10 August - 15 August
   * 10 Aug 2026 to 15 Aug 2026
   */

  const rangePattern =
    /(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{4})?\s*(?:to|-|–|until|till)\s*(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{4})?/i;

  const match = text.match(rangePattern);

  if (!match) {
    return {
      startDate: "",
      endDate: "",
    };
  }

  const startYear = match[3] ? Number(match[3]) : new Date().getFullYear();

  const endYear = match[6] ? Number(match[6]) : startYear;

  return {
    startDate: toISODate(match[1], match[2], startYear),

    endDate: toISODate(match[4], match[5], endYear),
  };
};

const extractTime = (text) => {
  const match = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
  );

  if (!match) return "";

  return `${match[1]} - ${match[2]}`;
};

const generateTitle = (skills) => {
  if (!skills.length) {
    return "Training Requirement";
  }

  const selected = skills.slice(0, 2);

  return `${selected.join(" + ")} Trainer`;
};

export const parseRequirementMessage = (rawText) => {
  const text = cleanText(rawText);

  const skills = extractSkills(text);
  const dates = extractDates(text);

  return {
    title: generateTitle(skills),

    skills,

    city: extractCity(text),

    mode: extractMode(text),

    budget: extractBudget(text),

    experienceRequired: extractExperience(text),

    students: extractStudents(text),

    startDate: dates.startDate,

    endDate: dates.endDate,

    timing: extractTime(text),

    originalMessage: rawText,
  };
};
