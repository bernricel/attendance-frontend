export function DataLoading({ message = 'Loading...' }) {
  return <p className="data-state loading">{message}</p>
}

export function DataEmpty({ message = 'No data available.' }) {
  return <p className="data-state empty">{message}</p>
}

export function DataError({ message = 'Something went wrong.' }) {
  return <p className="data-state error">{message}</p>
}
