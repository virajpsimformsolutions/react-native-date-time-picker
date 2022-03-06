import dayjs from 'dayjs';
import React, { useCallback } from 'react';
import { useRef, useState } from 'react';
import { FlatListProps, StyleSheet, View, ViewStyle } from 'react-native';

import DateList from './DateList';
import { getData, numberOfDaysIn } from './helpers';
import type { ItemType, ListItemStyleType, Mode, PossibleDaysInMonth } from './types';

type Props = {
    mode?: Mode;
    /**
     * Initial Date to scroll to
     */
    initialValue?: Date;
    /**
     * Display TimePicker in 24 hour.
     */
    is24Hour?: boolean;
    /**
     * Callback to be called every time user change date
     */
    onChange: ($date: Date) => void;
    /**
     * Height of single item in list
     */
    itemHeight?: number;
    /**
     * Outermost View style
     */
    containerStyle?: ViewStyle;
    /**
     * Style for individual list item text
     */
    listItemStyle?: ListItemStyleType;
    /**
     * Color style for divider
     */
    separatorColor?: string;
    /**
     * Flat list props
     */
    flatListProps?: FlatListProps;
    /**
     * Maximum Date
     */
    maximumDate?: Date;
    /**
     * Minimum Date
     */
    minimumDate?: Date;
};

const DateTimePicker = ({
    mode = 'date',
    initialValue = new Date(),
    is24Hour = false,
    onChange,
    itemHeight = 40,
    containerStyle,
    listItemStyle,
    separatorColor,
    flatListProps,
    maximumDate,
    minimumDate,
}: Props) => {
    /**
     * If mode === 'date' depending upon year and month selected
     * number of days will different, hence we need to re-render list
     */
    const [numberOfDays, setNumberOfDays] = useState<PossibleDaysInMonth>(
        numberOfDaysIn(initialValue.getMonth() + 1, initialValue.getFullYear())
    );
    // clubbed Date List
    const clubbedDateListData = getData(mode, -1, {
        numberOfDays,
        is24Hour,
        maximumDate,
        minimumDate,
    });
    const clubbedDateItem = useRef<number>(initialValue);
    // Start List
    const startListData = getData(mode, 0, { numberOfDays, is24Hour });
    const selectedStartItem = useRef<number>(
        mode === 'date'
            ? initialValue.getDate()
            : is24Hour
            ? initialValue.getHours()
            : initialValue.getHours() < 13
            ? initialValue.getHours() === 0
                ? 12
                : initialValue.getHours()
            : initialValue.getHours() - 12
    );
    // Middle List
    const middleListData = getData(mode, 1);
    const selectedMiddleItem = useRef<number>(
        mode === 'date' ? initialValue.getMonth() : initialValue.getMinutes()
    );
    // End List
    const endListData = getData(mode, 2);
    const selectedEndItem = useRef<number>(
        mode === 'date' ? initialValue.getFullYear() : initialValue.getHours() > 11 ? 2 : 1
    );

    const getInitialScrollIndex = (
        preSelected: number | Date,
        data: Array<ItemType>,
        isDate?: boolean
    ) => {
        if (preSelected === -1) {
            return data.length - 2;
        }

        let index = data.findIndex((item) => {
            if (isDate)
                return (
                    dayjs(item.value).format('DD/MM/YYYY') ===
                    dayjs(preSelected).format('DD/MM/YYYY')
                );
            return item.value === preSelected;
        });
        index = index - 1;
        index = index < 0 ? 0 : index;

        return index;
    };

    const calculateNewDate = useCallback(() => {
        let year, month, day, hour, minute;
        let newDate = new Date(initialValue.getTime());
        if (mode === 'date') {
            year = selectedEndItem.current;
            month = selectedMiddleItem.current;
            day = selectedStartItem.current;
            newDate.setFullYear(year, month, day);
        } else {
            hour =
                is24Hour || selectedEndItem.current === 1
                    ? selectedStartItem.current
                    : selectedStartItem.current + 12;
            minute = selectedMiddleItem.current;
            if (hour === 24) {
                hour = 12;
            } else if (!is24Hour && selectedEndItem.current === 1 && hour === 12) {
                hour = 0;
            }
            newDate.setHours(hour, minute);
        }
        return newDate;
    }, [initialValue, is24Hour, mode]);

    const handleChange = useCallback(() => {
        if (mode === 'date') {
            const newNumberOfDays = numberOfDaysIn(
                selectedMiddleItem.current + 1, //month
                selectedEndItem.current // year
            );

            if (newNumberOfDays !== numberOfDays) {
                setNumberOfDays(newNumberOfDays);
            }
        }
        onChange(calculateNewDate());
    }, [mode, onChange, calculateNewDate, numberOfDays]);

    return (
        <View style={containerStyle}>
            <View style={styles.row}>
                {mode === 'datetime' && (
                    <DateList
                        data={clubbedDateListData}
                        itemHeight={itemHeight}
                        onChange={handleChange}
                        selectedValue={clubbedDateItem}
                        listItemStyle={[listItemStyle, styles.clubbedDateListItemStyle]}
                        initialScrollIndex={getInitialScrollIndex(
                            clubbedDateItem.current,
                            clubbedDateListData,
                            true
                        )}
                        style={styles.clubbedDateListStyle}
                        separatorColor={separatorColor}
                        flatListProps={flatListProps}
                    />
                )}
                <DateList
                    data={startListData}
                    itemHeight={itemHeight}
                    onChange={handleChange}
                    listItemStyle={listItemStyle}
                    selectedValue={selectedStartItem}
                    initialScrollIndex={getInitialScrollIndex(
                        selectedStartItem.current,
                        startListData
                    )}
                    separatorColor={separatorColor}
                    flatListProps={flatListProps}
                />
                <DateList
                    data={middleListData}
                    itemHeight={itemHeight}
                    selectedValue={selectedMiddleItem}
                    onChange={handleChange}
                    listItemStyle={listItemStyle}
                    style={styles.middleListStyle}
                    initialScrollIndex={getInitialScrollIndex(
                        selectedMiddleItem.current,
                        middleListData
                    )}
                    separatorColor={separatorColor}
                    flatListProps={flatListProps}
                />
                {(mode === 'date' || !is24Hour) && (
                    <DateList
                        data={endListData}
                        itemHeight={itemHeight}
                        listItemStyle={listItemStyle}
                        selectedValue={selectedEndItem}
                        onChange={handleChange}
                        initialScrollIndex={getInitialScrollIndex(
                            selectedEndItem.current,
                            endListData
                        )}
                        separatorColor={separatorColor}
                        flatListProps={flatListProps}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    middleListStyle: {
        marginHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
    },
    buttonContainer: {
        marginTop: 16,
    },
    cancelButton: {
        marginEnd: 8,
    },
    confirmButton: {
        marginStart: 8,
    },
    clubbedDateListStyle: {
        marginRight: 24,
        flex: 4,
    },
    clubbedDateListItemStyle: {
        textAlign: 'left',
    },
});

export default DateTimePicker;
