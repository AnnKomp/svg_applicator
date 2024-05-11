import {useState} from 'react';

export default function GeoLocation({}) {
    const [longitude, setLongitude] = useState();
    const [latitude, setLatitude] = useState();
    const [accuracy, setAccuracy] = useState();
    const [message, setMessage] = useState('');
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            setMessage('Geolocation is not supported by this browser.');
        }
    };
    const showPosition = position => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
    };
    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setMessage('User denied the request for Geolocation.');
                break;
            case error.POSITION_UNAVAILABLE:
                setMessage('Location information is unavailable.');
                break;
            case error.TIMEOUT:
                setMessage('The request to get user location timed out.');
                break;
            case error.UNKNOWN_ERROR:
                setMessage('An unknown error occurred.');
                break;
        }
    }
    return (
        <div className="h-screen bg-pwhite">
            <div className="flex flex-col items-center">
                <div className="flex flex-col text-center">
                    <div className="pr-1">Message:</div>
                    <div>{message}</div>
                </div>
                <div className="flex flex-col text-center">
                    <div className="pr-1">Latitude:</div>
                    <div>{latitude}</div>
                </div>
                <div className="flex flex-col text-center">
                    <div className="pr-1">Longitude:</div>
                    <div>{longitude}</div>
                </div>
                <div>
                    <div>La précision est de {accuracy} mètres.</div>
                </div>
                <button className="w-20 px-2 py-1 text-white bg-black" onClick={() => getLocation()}>
                    GeoLoc
                </button>
            </div>
        </div>
    );
}