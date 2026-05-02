export const METRIC_INFO = {
  totalPremium: {
    title: "Total Premium",
    en: "Sum of premium amounts from all your policies in the system. This is premium volume, not your personal earning.",
    ta: "இது உங்கள் அனைத்து policies-இலிருந்தும் வரும் premium amount மொத்தம். இது உங்கள் கமிஷன்/earnings அல்ல; premium volume மட்டும்.",
  },
  activePolicies: {
    title: "Active Policies",
    en: "Policies currently considered active based on due date and end date rules.",
    ta: "Due date மற்றும் end date விதிகளின் அடிப்படையில் தற்போது active ஆக உள்ள policies எண்ணிக்கை.",
  },
  lapsedPolicies: {
    title: "Lapsed Policies",
    en: "Policies counted as lapsed or expired when due/end date conditions are crossed.",
    ta: "Due date அல்லது end date கடந்ததால் lapsed/expired ஆக கணக்கிடப்படும் policies.",
  },
  earningsBase: {
    title: "Agent Earnings (Base)",
    en: "Estimated agent revenue using base commission slabs (for example LIC 22.5% year-1, Star Health 15% base).",
    ta: "Base commission slabs அடிப்படையில் கணக்கிடப்பட்ட agent வருவாய் மதிப்பீடு (எ.கா. LIC year-1 22.5%, Star Health 15%).",
  },
  earningsPotential: {
    title: "Agent Earnings (Potential)",
    en: "Higher-side earnings estimate using max incentive-capable commission rates.",
    ta: "Incentive கிடைக்கும் உயர்ந்த commission விகிதங்களை வைத்து கணக்கிடப்பட்ட அதிகபட்ச earnings மதிப்பீடு.",
  },
  projectedRevenue: {
    title: "Projected Revenue",
    en: "Projected agent earnings within the trend window from active policies using base rates.",
    ta: "Trend window-இல் active policies அடிப்படையில் base rates கொண்டு கணக்கிடப்பட்ட projected agent earnings.",
  },
  collectedCycle: {
    title: "Collected Revenue (Cycle)",
    en: "Agent earnings from payment entries that fall inside the current chart/trend window.",
    ta: "தற்போதைய chart/trend window-க்குள் உள்ள payment entries-இலிருந்து கிடைத்த agent earnings.",
  },
  potentialCeiling: {
    title: "Potential Ceiling",
    en: "Upper-bound estimate for the same trend window using potential max rates.",
    ta: "அதே trend window-க்கு potential max rates வைத்து கணக்கிடப்பட்ட அதிகபட்ச வரம்பு மதிப்பீடு.",
  },
  collectedThisMonth: {
    title: "Collected This Month",
    en: "Agent earnings from premiums marked as paid in the current calendar month. If there are no current-month payments, UI may show the latest payment month figure for easier review.",
    ta: "நடப்பு மாதத்தில் paid என்று பதிவு செய்யப்பட்ட premiums-இலிருந்து கிடைக்கும் agent earnings. நடப்பு மாதத்தில் payment இல்லை என்றால், புரிதலுக்காக சமீபத்திய payment மாத மதிப்பு காட்டப்படலாம்.",
  },
  collectedLifetime: {
    title: "Collected Lifetime",
    en: "Total agent earnings from all payment entries recorded so far.",
    ta: "இப்போது வரை பதிவு செய்யப்பட்ட அனைத்து payment entries-இலிருந்தும் கிடைத்த மொத்த agent earnings.",
  },
  paymentsLogged: {
    title: "Payments Logged",
    en: "Total number of payment entries used to compute collected metrics.",
    ta: "Collected metrics கணக்கிட பயன்படுத்தப்பட்ட payment entries மொத்த எண்ணிக்கை.",
  },
};
