const capitalizedText = (name) => {
  return name
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export default capitalizedText;
