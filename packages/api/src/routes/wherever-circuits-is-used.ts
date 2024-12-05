let circuitsPackage;
try {
  circuitsPackage = await import('@persona/circuits');
} catch (error) {
  console.warn('Circuits package not available');
} 