"""Tests for the logic bug sample project.

These tests expose the bugs in the calculator.
"""

import pytest
from calculator import add, subtract, multiply, divide, average, factorial, percentage


def test_add():
    assert add(2, 3) == 5


def test_subtract():
    assert subtract(5, 3) == 2


def test_multiply():
    assert multiply(3, 4) == 12


def test_divide_normal():
    assert divide(10, 2) == 5.0


def test_divide_by_zero():
    """Division by zero should raise ValueError, not ZeroDivisionError."""
    with pytest.raises(ValueError):
        divide(10, 0)


def test_average():
    """Average of [1, 2, 3] should be 2.0, not 1.5."""
    result = average([1, 2, 3])
    assert result == 2.0, f"Expected 2.0, got {result} — off-by-one bug!"


def test_average_single():
    """Average of a single number should be that number."""
    assert average([5]) == 5.0


def test_factorial_zero():
    assert factorial(0) == 1


def test_factorial_positive():
    assert factorial(5) == 120


def test_factorial_negative():
    """Factorial of negative number should raise ValueError."""
    with pytest.raises(ValueError):
        factorial(-1)


def test_percentage_normal():
    assert percentage(25, 100) == 25.0


def test_percentage_zero_total():
    """Percentage with zero total should raise ValueError."""
    with pytest.raises(ValueError):
        percentage(10, 0)
