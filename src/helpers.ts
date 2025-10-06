export function showError(errorText: string) {
  console.error(errorText);
  const errorBoxDiv = document.getElementById('error-box');
  if (errorBoxDiv === null) {
    return;
  }
  const errorElement = document.createElement('p');
  errorElement.innerText = errorText;
  errorBoxDiv.appendChild(errorElement);
}
