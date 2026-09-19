"""Calculator with logic bugs — sample for SentinelLab demo.

WARNING: This code has INTENTIONAL bugs for testing purposes.
"""


def add(a, b):
    """Add two numbers."""
    return a + b


def subtract(a, b):
    """Subtract b from a."""
    return a - b


def multiply(a, b):
    """Multiply two numbers."""
    return a * b


def divide(a, b):
    """Divide a by b — BUG: no division-by-zero check."""
    # VULNERABILITY: No check for division by zero
    return a / b


def average(numbers):
    """Calculate average — BUG: off-by-one error."""
    total = sum(numbers)
    # VULNERABILITY: Off-by-one, should be len(numbers) not len(numbers) + 1
    return total / (len(numbers) + 1)


def factorial(n):
    """Calculate factorial — BUG: missing base case for negative numbers."""
    # VULNERABILITY: No check for negative numbers, will recurse infinitely
    if n == 0:
        return 1
    return n * factorial(n - 1)


def percentage(value, total):
    """Calculate percentage — BUG: no zero-total check."""
    # VULNERABILITY: No check for total being zero
    return (value / total) * 100
