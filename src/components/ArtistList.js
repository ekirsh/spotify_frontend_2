import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import { TypeAnimation } from 'react-type-animation';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import moment from 'moment';
import { Card, CategoryBar } from '@tremor/react';
import { Metric, Text } from '@tremor/react';


const PopupModal = () => {
  const [isOpen, setIsOpen] = useState(true);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md overflow-hidden">
            <div className="flex justify-end px-4 pt-2 mt-2">
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Welcome to the Spotify A&R Tool</h2>
              <p className="text-gray-600 mb-6">We're tracking hundreds of popular editorial/independent playlists, and then monitoring the artists gaining the most followers from these playlists.  </p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
                onClick={closeModal}
              >
                OK!
              </button>
            </div>
            <div className="bg-gray-100 px-6 py-4 text-sm text-gray-600">
              <p><span className="font-semibold">Pro Tip:</span> Sort by <i>Avg Daily Follower Growth</i> for best results</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};



const FollowersAnalytics = ({ data, artistName }) => {
  const calculateAveragePercentageChange = () => {
    if (data.length <= 1) {
      return 0;
    }

    const firstTimestamp = new Date(data[0].timestamp);
    const lastTimestamp = new Date(data[data.length - 1].timestamp);

    const timeDifferenceInMs = lastTimestamp.getTime() - firstTimestamp.getTime();
    const daysElapsed = Math.ceil(timeDifferenceInMs / (1000 * 60 * 60 * 24));

    const initialFollowers = data[0].followers;
    const finalFollowers = data[data.length - 1].followers;

    const followersChange = finalFollowers - initialFollowers;
    const percentageChange = (followersChange / initialFollowers) * 100;

    const averagePercentageChange = percentageChange / daysElapsed;
    return averagePercentageChange;
  };

  const [showChart, setShowChart] = useState(false);

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  const chartData = {
    labels: data.map(d => moment(d.timestamp).format('YYYY-MM-DD')),
    datasets: [
      {
        label: 'Followers',
        data: data.map(d => d.followers),
        fill: false,
        backgroundColor: 'rgb(59, 130, 246)',
        borderColor: 'rgba(59, 130, 246, 0.2)',
      },
    ],
  };

  return (
    <div className="">
      <button
        onClick={toggleChart}
        className=""
      >
      <Card className="mx-auto max-w-xs p-2">
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content text-sm"><FontAwesomeIcon icon={faSpotify} size="sm" /> Avg Daily Follower Growth</p>
                    <p className="text-lg text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{calculateAveragePercentageChange().toFixed(2)}%</p>
                    <p className="text-xs text-gray-400"><FontAwesomeIcon icon={faChartLine} size="xs" className="mr-2" />Click to view chart</p>
                </Card>
      
      </button>
      {showChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg max-w-md overflow-hidden">
            <div className="flex justify-end px-4 pt-2 mt-2">
              <button onClick={toggleChart} className="text-gray-500 hover:text-gray-800 focus:outline-none">
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4"><FontAwesomeIcon icon={faSpotify} size="lg" /> Follower Growth Chart</h2>
              <h3 className="text-xl font-semibold mb-4 text-gray-400">{artistName}</h3>
              <Line data={chartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};





function ArtistList() {

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('playlist_count'); // Default sorting by popularity
  const [sortOrder, setSortOrder] = useState('desc'); // Default sorting order
  const [sortFollowerGrowth, setSortFollowerGrowth] = useState('desc'); // Default sorting order for follower growth
  const [minFollowers, setMinFollowers] = useState(350);
  const [maxFollowers, setMaxFollowers] = useState(50000);
  const [minPlaylistCount, setMinPlaylistCount] = useState(0);
  const [maxPlaylistCount, setMaxPlaylistCount] = useState(25);
  const [scanActive, setScanActive] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showGenreFilter, setShowGenreFilter] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [showLabelFilter, setShowLabelFilter] = useState(false);
  const [showFollowersFilter, setShowFollowersFilter] = useState(false);

  const handleLabelChange = (label) => {
    setSelectedLabel(label);
    setShowLabelFilter(false);
  };

  const sortArtists = (artists) => {
    return artists.sort((a, b) => {
      const aValue = getSortingValue(a, sortBy);
      const bValue = getSortingValue(b, sortBy);
  
      if (sortBy === 'follower_growth') {
        // Special handling for follower growth
        const aFollowerGrowth = calculateAveragePercentageChange(a.follower_history);
        const bFollowerGrowth = calculateAveragePercentageChange(b.follower_history);
  
        return sortFollowerGrowth === 'asc' ? aFollowerGrowth - bFollowerGrowth : bFollowerGrowth - aFollowerGrowth;
      }
  
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  };

  const handleFollowerGrowthSortChange = () => {
    setSortFollowerGrowth((prevSortOrder) => (prevSortOrder === 'asc' ? 'desc' : 'asc'));
  };

  const calculateAveragePercentageChange = (datab) => {
    if (datab.length <= 1) {
      // Handle the case where there's not enough data for comparison
      return 0;
    }

    // Extract the timestamps from the first and last data points
    const firstTimestamp = new Date(datab[0].timestamp);
    const lastTimestamp = new Date(datab[datab.length - 1].timestamp);

    // Calculate the difference in milliseconds between the first and last timestamps
    const timeDifferenceInMs = lastTimestamp.getTime() - firstTimestamp.getTime();

    // Calculate the number of days between the first and last timestamps
    const daysElapsed = Math.ceil(timeDifferenceInMs / (1000 * 60 * 60 * 24));

    // Get followers count from the first and last day
    const initialFollowers = datab[0].followers;
    const finalFollowers = datab[datab.length - 1].followers;

    // Calculate followers change and percentage change
    const followersChange = finalFollowers - initialFollowers;
    const percentageChange = (followersChange / initialFollowers) * 100;

    // Calculate average percentage change
    const averagePercentageChange = percentageChange / daysElapsed;

    return averagePercentageChange;
  };

  const getSortingValue = (artist, sortBy) => {
    // Helper function to get the sorting value for the selected option
    switch (sortBy) {
      case 'popularity':
        return artist.popularity;
      case 'artist_followers':
        return artist.artist_followers;
      case 'total_followers':
        return artist.total_followers;
      case 'follower_listener_ratio':
        return artist.follower_listener_ratio;
      case 'follower_growth':
        return calculateAveragePercentageChange(artist.follower_history);
      // Handle other sorting options if needed
      default:
        return artist.playlist_count;
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://server-wsrz.onrender.com/artists');
        const scan_status = await fetch('https://server-wsrz.onrender.com/scanstatus');
        console.error(scan_status);
        const data = await response.json();
        const scan_data = await scan_status.json()
        console.error(scan_data);
        setArtists(data);
        setScanActive(scan_data[0]["active_scan"]);

        // Extract and count genres
        const allGenres = data.reduce((acc, curr) => {
          return acc.concat(curr.genres);
        }, []);
        
        // Count occurrences of each genre
        const genreCounts = allGenres.reduce((acc, genre) => {
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {});

        // Sort genres by occurrence count
        const sortedGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);

        setGenres(sortedGenres);
        console.log(sortedGenres);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenreChange = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleClickOutside = (event) => {
    if (event.target.closest('.genre-filter') === null) {
      setShowGenreFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);
  

  const [loadingArtist, setLoadingArtist] = useState(null);
  const [generatedBio, setGeneratedBio] = useState({});

  const handleArtistClick = (artistName) => {
    setLoadingArtist(artistName);

    fetch(`https://python-ot6e.onrender.com/ai?name=${encodeURIComponent(artistName)}`)
      .then(response => response.json())
      .then(data => {
        setGeneratedBio(prevState => ({
          ...prevState,
          [artistName]: data.result // Assuming 'bio' is the key in the response containing the generated text
        }));
      })
      .catch(error => {
        console.error('Error fetching artist data:', error);
      })
      .finally(() => {
        setLoadingArtist(null);
      });
  };

  if (loading || scanActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Render spinner only when loading is true and scanActive is false */}
        {loading && !scanActive && (
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        )}
        <h6 className="text-xl font-bold">
          {scanActive
            ? 'Scanning the internet for new artist data. Please come back later...'
            : 'Booting up your artist dashboard. This may take a minute...'}
        </h6>
      </div>
    );
  }


  return (

    <div className='bg-gray-100'>
        <PopupModal />
      <div className="sticky top-0 z-10 bg-white p-4 px-8 shadow-md">
  <div className="flex md:flex-row items-center justify-between">

  <div className="mb-2 md:flex items-center space-x-4">
  <label className="text-gray-700 font-medium">Sort by:</label>
  <div className="relative">
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded-md pr-8 appearance-none"
    >
      <option value="playlist_count">Playlist Count</option>
      <option value="follower_growth">✦ Avg Daily Follower Growth</option>
      <option value="popularity">Popularity</option>
      <option value="artist_followers">Followers</option>
      <option value="total_followers">Playlist Reach</option>
      <option value="follower_listener_ratio">Followers/Listeners</option>
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
    </div>
  </div>
  {sortBy === 'follower_growth' && (
    <div className="relative">
      <select
        value={sortFollowerGrowth}
        onChange={handleFollowerGrowthSortChange}
        className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded-md pr-8 appearance-none"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      </div>
    </div>
  )}
  {sortBy !== 'follower_growth' && (
    <div className="relative">
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded-md pr-8 appearance-none"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      </div>
    </div>
  )}


      <div className="relative genre-filter">
              <button
                className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded"
                onClick={() => setShowGenreFilter(!showGenreFilter)}
              >
                Filter by Genres{' '}
                {selectedGenres.length > 0 && (
                  <span className="text-xs text-gray-600">({selectedGenres.length})</span>
                )}
              </button>
              {showGenreFilter && (
                <div className="absolute z-10 bg-white border rounded-md shadow-lg mt-2 w-64 max-h-64 overflow-y-auto">
                  <div className="p-4">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreChange(genre)}
                        className={`mr-2 mb-2 px-3 py-1 rounded-full text-sm font-semibold focus:outline-none ${
                          selectedGenres.includes(genre)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                        }`}
                      >
                        {genre} ({artists.filter((artist) => artist.genres.includes(genre)).length})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>


            <div className="relative">
              <button
                className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded"
                onClick={() => setShowLabelFilter(!showLabelFilter)}
              >
                Filter by Label{' '}
                {selectedLabel !== 'all' && (
                  <span className="text-xs text-gray-600">({selectedLabel})</span>
                )}
              </button>
              {showLabelFilter && (
                <div className="absolute z-10 bg-white border rounded-md shadow-lg mt-2 w-64 max-h-64 overflow-y-auto">
                  <div className="p-4">
                    <button
                      onClick={() => handleLabelChange('all')}
                      className={`mb-2 ml-1 px-3 py-1 rounded-full text-sm font-semibold focus:outline-none ${
                        selectedLabel === 'all'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleLabelChange('Unsigned')}
                      className={`mb-2 ml-1 px-3 py-1 rounded-full text-sm font-semibold focus:outline-none ${
                        selectedLabel === 'Unsigned'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      Unsigned
                    </button>
                    <button
                      onClick={() => handleLabelChange('Signed')}
                      className={`mb-2 ml-1 px-3 py-1 rounded-full text-sm font-semibold focus:outline-none ${
                        selectedLabel === 'Signed'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      Signed
                    </button>
                  </div>
                </div>
              )}
            </div>


            <div className="relative">
              <button
                className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-semibold py-2 px-4 rounded"
                onClick={() => setShowFollowersFilter(!showFollowersFilter)}
              >
                Filter by Follower Count 
              </button>
              {showFollowersFilter && (
                <div className="absolute z-10 bg-white border rounded-md shadow-lg mt-2 w-64 max-h-64 overflow-y-auto">
                  <div className="ml-4 mt-4 md:mt-0">
                    <div className="mt-2 mb-4">
                      <label className="text-sm">Followers Range:</label>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs">Min: {minFollowers}</span>
                        <Slider
                          min={0}
                          max={350000}
                          value={[minFollowers, maxFollowers]}
                          onChange={(values) => {
                            setMinFollowers(values[0]);
                            setMaxFollowers(values[1]);
                          }}
                          range
                          style={{ width: '150px' }}
                        />
                        <span className="text-xs">Max: {maxFollowers}</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>


    </div>



    

    

  </div>
</div>


    
<ResponsiveMasonry
                columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 4}}
            >
    <Masonry className="my-masonry">
    {sortArtists(artists.filter(
        (artist) =>
          artist.playlist_count >= minPlaylistCount &&
          artist.playlist_count <= maxPlaylistCount &&
          artist.artist_followers >= minFollowers &&
          artist.artist_followers <= maxFollowers &&
          selectedGenres.every((genre) => artist.genres.includes(genre)) &&
          (selectedLabel === 'all' ||
                  (selectedLabel === 'Unsigned' &&
                    ['DistroKid', 'CDBaby', 'TuneCore', 'Self-released',''].includes(artist.label)) ||
                  (selectedLabel === 'Signed' && !['DistroKid', 'CDBaby', 'TuneCore', 'Self-released', ''].includes(artist.label)))
      )).map(artist => (
      <div
          className="block max-w-xs bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 m-4 hover:shadow-lg transition-shadow duration-300 ease-in-out"
        >
          <a href={artist.url} target="_blank">
          <img className="rounded-t-lg" src={artist.image} alt={artist.name} />
          </a>
      <div className="p-5">
      <div className="flex items-center">
    <a href={artist.url} target="_blank" className="flex-grow">
      <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{artist.name}</h5>
    </a>
    {artist.instagram && (
      <a href={artist.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="ml-2">
        <FontAwesomeIcon icon={faInstagram} size="lg" />
      </a>
    )}
  </div>
  <div className="mb-5">
    {artist.genres && artist.genres.length > 0 &&
    <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
      {artist.genres.join(', ')}
    </h5>
    }
    <h5 className="text-xs text-gray-500 mt-1 dark:text-gray-400">{artist.label}</h5>
  </div>
        <Card className="mx-auto max-w-sm mb-3">
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content flex items-center justify-between">
          <span>Popularity</span>
          <span>{artist.popularity}%</span>
        </p>
      <CategoryBar
              values={[20, 30, 20, 30]}
              colors={['red', 'orange', 'yellow', 'green']}
              markerValue={artist.popularity}
              className="mt-3"
            />
            </Card>
            <div className="flex items-center mt-2.5">
                <Card className="mx-auto max-w-xs p-2">
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content text-sm"><FontAwesomeIcon icon={faSpotify} size="sm" /> Listeners</p>
                    <p className="text-lg text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{artist.monthly_listeners.toLocaleString()}</p>
                </Card>
                <div className="mx-2"></div> {/* Add a spacer with horizontal margin */}
                <Card className="mx-auto max-w-xs p-2">
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content text-sm"><FontAwesomeIcon icon={faSpotify} size="sm" /> Followers</p>
                    <p className="text-lg text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{artist.artist_followers.toLocaleString()}</p>
                </Card>
            </div>

            <div className="flex items-center mt-2.5">
                <Card className="mx-auto max-w-xs p-2">
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content text-sm"><FontAwesomeIcon icon={faSpotify} size="sm" /> Playlist Count</p>
                    <p className="text-lg text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{artist.playlist_count}</p>
                </Card>
                <div className="mx-2"></div> {/* Add a spacer with horizontal margin */}
                <Card className="mx-auto max-w-xs p-2">
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content text-sm"><FontAwesomeIcon icon={faSpotify} size="sm" /> Playlist Reach</p>
                    <p className="text-lg text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{artist.total_followers.toLocaleString()}</p>
                </Card>
            </div>

        <div className="flex items-center mb-2.5 mt-2.5">
        <FollowersAnalytics data={artist.follower_history} artistName={artist.name} />
        </div>
        <div className="flex items-center mb-5 mt-2.5">
        <Card className="mx-auto max-w-xs p-2">
                    <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content text-sm"><FontAwesomeIcon icon={faSpotify} size="sm" /> Followers/Listeners</p>
                    <p className="text-lg text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{(artist.follower_listener_ratio * 100).toFixed(2)}%</p>
                </Card>
                </div>
        {loadingArtist === artist.name ? (
            <div className="flex justify-center items-center mt-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <TypeAnimation
                sequence={[
                  'Scanning the internet...', // Text to type
                  2000,      // Wait 1 second
                  '',        // Delete text
                  2000,
                  'Summarizing your info...', 
                  2000,      // Wait 1 second before repeating
                  '',        // Delete text
                ]}
                wrapper="div"
                cursor={true}
                repeat={Infinity}
                style={{ fontSize: '0.75em', marginLeft: '10px' }}
              />
            </div>
          ) : (
            <>
              {artist.description ? (
              // Display artist description if it exists
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {artist.description}
              </p>
            ) : (
              // Show the "Generate AI Bio" button if no description
              <>
                {!generatedBio[artist.name] && (
                  <button
                    onClick={() => handleArtistClick(artist.name)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Generate AI Bio ✨ <p className="text-xs text-gray-200">Contents may be inaccurate</p>
                  </button>
                )}
                {generatedBio[artist.name] && (
                  <TypeAnimation
                  splitter={(str) => str.split(/(?= )/)} // 'Lorem ipsum dolor' -> ['Lorem', ' ipsum', ' dolor']
                  sequence={[
                    generatedBio[artist.name],
                    3000,
                  ]}
                  speed={{ type: 'keyStrokeDelayInMs', value: 60 }}
                  omitDeletionAnimation={true}
                  style={{ fontSize: '0.75em', display: 'block', minHeight: '200px' }}
                  repeat={0}
                />
                )}
              </>
            )}
            </>
          )}
        <hr class="my-6 h-0.5 border-t-0 bg-neutral-100 opacity-100 dark:opacity-50" />
        <div className="grid grid-cols-2 gap-4">
          {artist.playlist_list.slice(0, 6).map((playlist, index) => (
            <a key={index} href={playlist.url} target="_blank" rel="noopener noreferrer" className="playlist-item">
              <div className="flex flex-col items-center hover:opacity-80 transition duration-300">
                <img className="w-16 h-16 object-cover rounded shadow-lg" src={playlist.image} alt={playlist.name} />
                <span className="text-xs text-center text-gray-500 dark:text-gray-400">{playlist.name}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
    ))}
  </Masonry>
  </ResponsiveMasonry>
  </div>

  );
}

export default ArtistList;
