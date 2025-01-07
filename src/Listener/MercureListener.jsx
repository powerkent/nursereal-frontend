import { useEffect } from 'react';

function MercureListener() {
  useEffect(() => {
    const url = new URL('http://localhost:8083/.well-known/mercure');
    url.searchParams.append(
      'topic',
      'http://localhost:8080/api/message_resources'
    );

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Message reçu :', data);
    };

    eventSource.onerror = (error) => {
      console.error('Erreur EventSource:', error);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <div>Écoute des messages Mercure...</div>;
}

export default MercureListener;
