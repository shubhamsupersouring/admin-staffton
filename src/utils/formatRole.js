export const formatRole = (role) => {
  if (!role) return 'Not Set';
  const roleLower = role.toLowerCase();
  if (roleLower === 'non_clinical') return 'Non-Clinical';
  if (roleLower === 'doctor') return 'Doctor';
  if (roleLower === 'nurse') return 'Nurse';
  if (roleLower === 'clinical') return 'Clinical';
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};