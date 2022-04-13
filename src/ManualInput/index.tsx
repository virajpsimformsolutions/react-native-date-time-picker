import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ImageUrl } from '../config/ImageUrls';
import { validateDate, validateTime } from '../helpers';
import { InputDefaultLength, ManualInputDefault, Mode } from '../types';
import { InputWithIcon } from './InputWithIcon';
import SelectAmPm from './SelectAmPm';

type Props = {
    onChange: (text: Date) => void;
    setError: (err: string) => void;
    mode: Mode;
};
export enum SelectAmOrPm {
    am = 'AM',
    pm = 'PM',
}
const ManualInput = ({ onChange, setError, mode }: Props) => {
    console.log(mode);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timeError, setTimeError] = useState('');
    const [dateError, setDateError] = useState('');

    const [selected, setSelected] = useState<SelectAmOrPm>(SelectAmOrPm.am);
    const onInputDateChange = (text: string) => {
        setDateError('');
        setError('');
        const dateMaxLength =
            mode === 'date' ? InputDefaultLength.LongDate : InputDefaultLength.ShortDate;
        if (text.length === dateMaxLength) {
            const day = text.substring(0, 2);
            const month = text.substring(2, 4);
            const year = mode === 'date' ? text.substring(4, 8) : new Date().getFullYear();
            console.log(year);
            const currentDate = `${year}/${month}/${day}`;
            if (validateDate(currentDate, 'YYYY/MM/DD')) {
                setDate(currentDate);
            } else {
                setDateError('Invalid date');
                setError('Invalid date');
            }
        } else {
            setDate('');
        }
    };

    const onInputTimeChange = (text: string) => {
        setTimeError('');
        setError('');
        if (text.length === InputDefaultLength.Time) {
            const hour = text.substring(0, 2);
            const min = text.substring(2, 4);
            const currentTime = `${hour}:${min}`;
            if (validateTime(currentTime, /^(0?[1-9]|1[0-2]):[0-5][0-9]$/)) {
                setTime(currentTime);
            } else {
                setTimeError('Invalid time');
                setError('Invalid time');
            }
        } else {
            setTime('');
        }
    };
    const onChangeDate = () => {
        if (date) {
            const formattedDate = dayjs(date, 'YYYY/MM/DD').toDate();
            onChange(formattedDate);
        }
    };
    const onChangeDateTime = () => {
        if (date && time) {
            const formattedDate = dayjs(
                `${date}, ${time} ${selected}`,
                'YYYY/MM/DD, hh:mm a'
            ).toDate();
            onChange(formattedDate);
        }
    };
    useEffect(() => {
        if (mode === 'datetime') {
            onChangeDateTime();
        } else {
            onChangeDate();
        }
    }, [date, time, selected]);

    return (
        <View style={styles.container}>
            <InputWithIcon
                onInputChange={onInputDateChange}
                iconUrl={ImageUrl.CALENDAR}
                defaultValue={
                    mode === 'date' ? ManualInputDefault.LongDate : ManualInputDefault.ShortDate
                }
                errorText={dateError}
                maxLength={
                    mode === 'date' ? InputDefaultLength.LongDate : InputDefaultLength.ShortDate
                }
            />
            {mode === 'datetime' ? (
                <>
                    <InputWithIcon
                        onInputChange={onInputTimeChange}
                        iconUrl={ImageUrl.CLOCK_ICON}
                        defaultValue={ManualInputDefault.Time}
                        containerStyle={styles.marginLeftAuto}
                        errorText={timeError}
                        maxLength={InputDefaultLength.Time}
                    />
                    <SelectAmPm selected={selected} setSelected={setSelected} />
                </>
            ) : (
                <></>
            )}
        </View>
    );
};

export default ManualInput;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: 114,
        backgroundColor: '#000000',
    },
    marginLeftAuto: {
        marginLeft: 'auto',
    },
});