# Metrics Glossary (English + Tamil)

This file explains dashboard and analytics terms used in the agent view.

## Premium & Policy Metrics

- **Total Premium**
  - **EN:** Sum of premium amounts from all policies in the system. This is premium volume, not agent earnings.
  - **TA:** அனைத்து policies-இலிருந்தும் வரும் premium amount மொத்தம். இது agent earnings அல்ல; premium volume மட்டும்.

- **Active Policies**
  - **EN:** Policies currently active based on due date and end date logic.
  - **TA:** Due date மற்றும் end date விதிகளின் அடிப்படையில் தற்போது active நிலையில் உள்ள policies.

- **Lapsed Policies**
  - **EN:** Policies considered lapsed or expired when due/end-date conditions are crossed.
  - **TA:** Due date அல்லது end date கடந்ததால் lapsed/expired ஆக கணக்கிடப்படும் policies.

## Agent Earnings Metrics

- **Agent Earnings (Base)**
  - **EN:** Estimated agent revenue using base commission slabs.
  - **TA:** Base commission விகிதங்களைக் கொண்டு கணக்கிடப்பட்ட agent earnings மதிப்பீடு.

- **Agent Earnings (Potential)**
  - **EN:** Higher-side estimate using max incentive-capable commission rates.
  - **TA:** Incentive உடன் கிடைக்கக்கூடிய அதிகபட்ச commission rates கொண்டு கணக்கிடப்பட்ட earnings மதிப்பீடு.

- **Projected Revenue**
  - **EN:** Projected earnings in the trend window from active policies using base rates.
  - **TA:** Trend window-இல் active policies அடிப்படையில் base rates கொண்டு கணக்கிடப்பட்ட projected earnings.

- **Collected Revenue (Cycle)**
  - **EN:** Earnings from payment entries that fall inside the current trend/chart window.
  - **TA:** தற்போதைய trend/chart window-க்குள் உள்ள payment entries-இலிருந்து கிடைத்த earnings.

- **Potential Ceiling**
  - **EN:** Upper-bound estimate for the same trend window using potential max rates.
  - **TA:** அதே trend window-க்கு potential max rates வைத்து கணக்கிடப்பட்ட அதிகபட்ச earnings வரம்பு.

- **Collected This Month**
  - **EN:** Earnings from premiums marked as paid during the current month.
  - **TA:** நடப்பு மாதத்தில் paid என்று பதிவு செய்யப்பட்ட premiums-இலிருந்து கிடைத்த earnings.

- **Collected Lifetime**
  - **EN:** Total earnings from all payment entries recorded so far.
  - **TA:** இப்போது வரை பதிவு செய்யப்பட்ட அனைத்து payment entries-இலிருந்தும் கிடைத்த மொத்த earnings.

- **Payments Logged / Payment Entries**
  - **EN:** Count of payment records used in collected metrics.
  - **TA:** Collected metrics கணக்கிட பயன்படுத்தப்பட்ட payment records எண்ணிக்கை.

## Important Validation Note

- **EN:** Do not compare Lifetime Collected directly with Projected Revenue if projected is for a limited trend window.
- **TA:** Projected Revenue ஒரு குறிப்பிட்ட trend window-க்கு என்றால், அதை Lifetime Collected உடன் நேரடியாக ஒப்பிட வேண்டாம்.
