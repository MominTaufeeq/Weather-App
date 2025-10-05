import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import debounce from 'lodash/debounce';
import { StatusBar } from "expo-status-bar";
import { theme } from "theme";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { fetchLocation, fetchWeatherForecast } from "api/weather";
import { weatherImages } from "constants";
import * as Progress from 'react-native-progress';
import { getData, storeData } from "utils/asyncStorage";

export default function HomeScreen() {

    const [showsearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({})
    const [loading, setLoding] = useState(false)


    const handleLocation = (loc: any) => {
        console.log('location', loc);
        setLocations([]);
        toggleSearch(false);
        setLoding(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoding(false);
            storeData('city', loc.name)
            // console.log('got data', data);
        })
    }

    useEffect(() => {
        fetchMyWeatherData();
    }, []);
    const fetchMyWeatherData = async () => {
        let myCity = await getData('city');
        let cityName = 'Bhiwandi';
        if (myCity) cityName = myCity;

        fetchWeatherForecast({
            cityName,
            days: '7'

        }).then(data => {
            setWeather(data)
            setLoding(false)
        })

    }

    const handleSearch = (value: any) => {
        if (value.length > 2) {
            fetchLocation({ cityName: value }).then((data: any) => {
                setLocations(data);
            })
        }

    }
    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);
    const { current, location } = weather;

    return (
        <View className="flex-1 relative">

            <StatusBar style="light" />
            <Image blurRadius={70} source={require('../assets/images/background.png')}
                className="absolute h-full w-full"
            />
            {
                loading ? (
                    <View className="flex-1 flex-row justify-center items-center">
                        <Progress.CircleSnail thickness={10} size={140} color={"#0bb3b2"} />
                    </View>
                ) : (
                    <SafeAreaView className="flex flex-1 pt-12 ">
                        {/*search section */}
                        <View style={{ height: '7%' }} className="mx-4 relative z-50">
                            <View className={`flex-row justify-end items-center ${showsearch ? 'rounded-full' : 'rounded-none'}`}
                                style={{ backgroundColor: showsearch ? theme.bgWhite(0.2) : 'transparent' }}>
                                {
                                    showsearch ? (

                                        <TextInput
                                            onChangeText={handleTextDebounce}
                                            placeholder="Search city"
                                            placeholderTextColor={'lightgray'}
                                            className="pl-6 h-15 flex-1 text-base text-white"
                                        />
                                    ) : null
                                }

                                <TouchableOpacity
                                    onPress={() => toggleSearch(!showsearch)}
                                    style={{ backgroundColor: theme.bgWhite(0.3) }}
                                    className="rounded-full p-5 m-1">
                                    <MagnifyingGlassIcon size={"25"} color={"white"} />
                                </TouchableOpacity>
                            </View>
                            {
                                locations.length > 0 && showsearch ? (
                                    <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                                        {
                                            locations.map((loc, index) => {
                                                let showBorder = index + 1 != locations.length;
                                                let borderClass = showBorder ? 'border-b-2 border-b-gray-400' : '';

                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => handleLocation(loc)}
                                                        key={index}
                                                        className={"flex-row items-center border-0 p-3 px-4 mb-1 " + borderClass}
                                                    >
                                                        <MapPinIcon size={20} color={"gray"} />
                                                        <Text className="text-black text-lg ml-2">
                                                            {loc.name}
                                                            {"," + loc?.country}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }
                        </View>
                        {/* forecast section */}
                        <View className="mx-4 flex justify-around flex-1 mb-2">
                            {/* Location */}
                            <Text className="text-white text-center text-2xl font-bold">
                                {location?.name}
                                <Text className="text-lg font-semibold text-gray-300">
                                    {", " + location?.country}
                                </Text>
                            </Text>
                            {/* weather images */}
                            <View className="flex-row justify-center">
                                <Image
                                    source={weatherImages[current?.condition?.text]}
                                    className="w-52 h-52" />
                            </View>
                            {/* degree celcius */}
                            <View className="space-y-2">
                                <Text className="text-center font-bold text-white text-6xl ml-5">
                                    {current?.temp_c}&#176;
                                </Text>
                                <Text className="text-center text-white text-xl tracking-widest">
                                    {current?.condition?.text}
                                </Text>
                            </View>
                            {/* other status */}
                            <View className="flex-row justify-between mx-4">
                                <View className="flex-row space-x-2 items-center">
                                    <Image source={require('../assets/images/humidity.png')} className="h-10 w-10" />
                                    <Text className="text-white font-semibold text-base">
                                        {current?.wind_kph}km
                                    </Text>
                                </View>
                                <View className="flex-row space-x-2 items-center">
                                    <Image source={require('../assets/images/drop.png')} className="h-9 w-9" />
                                    <Text className="text-white font-semibold text-base">
                                        {current?.humidity}%
                                    </Text>
                                </View>
                                <View className="flex-row space-x-2 items-center">
                                    <Image source={require('../assets/images/sun.png')} className="h-10 w-10" />
                                    <Text className="text-white font-semibold text-base">
                                        6:05 AM
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {/* forecast for next days */}
                        <View className="mb-10 space-y-3">
                            <View className="flex-row items-center mx-5 space-x-2">
                                <CalendarDaysIcon size={22} color={"white"} />
                                <Text className="text-white text-base">Daily forecast</Text>
                            </View>
                            <ScrollView
                                horizontal
                                contentContainerStyle={{ paddingHorizontal: 15 }}
                                showsHorizontalScrollIndicator={false}
                            >
                                {
                                    weather?.forecast?.forecastday?.map((item, index) => {
                                        let date = new Date(item.date);
                                        let options = { weekday: 'long' };
                                        let dayName = date.toLocaleDateString('en-US', options);
                                        return (
                                            <View
                                                key={index}
                                                className="flex justify-center items-center w-28 rounded-3xl py-3 space-y-1 mr-4"
                                                style={{ backgroundColor: theme.bgWhite(0.15) }}
                                            >
                                                <Image source={weatherImages[item?.day?.condition?.text]}
                                                    className="h-11 w-11" />
                                                <Text className="text-white">{dayName}</Text>
                                                <Text className="text-white text-xl font-semibold">
                                                    {item?.day?.avgtemp_c}&#176;

                                                </Text>
                                            </View>
                                        )
                                    })
                                }
                            </ScrollView>

                        </View>
                    </SafeAreaView>
                )
            }
        </View >

    )

}